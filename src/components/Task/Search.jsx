import React from 'react'
import { useState, useMemo, useEffect, useRef } from "react";
import { throttle } from "lodash";
import BackendLink from "../BackendLink";


function Search({DashboardCss, createSpecError, setCreateSpecError, createSpecSuccess, data, setData, formRef}) {
    const [searchedProduct, setSearchedProduct] = useState("");
    const [searchBoxData, setSearchBoxData] = useState([]);
    const lastOffsetRef = useRef(null);
    
  

 const searchProducts = async (product, offset) => {

        if (offset === 0) {
    lastOffsetRef.current = null;
  }

    setSearchedProduct(product);
    if(product.trim() === ""){
      setSearchBoxData([]); 
      return;
    }



    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const headers = {
        "Accept": "application/json",
        "Content-type": "application/json",
      };
      const data = {
        type: "searchProducts",
        product: product,
        offset: offset
      };
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      if (responseData.status === "success") {
        if (offset === 0) {
          setSearchBoxData(responseData.data);
        }else{
          setSearchBoxData(prevData => [...prevData, ...responseData.data]); 
        }
        setCreateSpecError("");
      } else {
        setCreateSpecError(responseData.message);
        setSearchBoxData([]);
      }
    } catch (err) {
      console.error(err);
      setSearchBoxData([]);
    }
  }


const loadMoreProducts = useMemo(() => {
  return throttle((e) => {
    const el = e.target;
    const offset = searchBoxData.length;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      if (lastOffsetRef.current === offset) return;
      lastOffsetRef.current = offset;
      searchProducts(searchedProduct, offset);
    }
  }, 300);
}, [searchedProduct, searchBoxData.length]);


  useEffect(() => {
    return () => {
      loadMoreProducts.cancel();
    };
  }, [loadMoreProducts]);

  const renderProduct = (ProductSizeId) => {
    if(data.filter(item => item.ProductSizeId === ProductSizeId).length > 0) return;

    const row = (searchBoxData.filter(item => item.ProductSizeId === ProductSizeId))[0];
    setData((prevdata) => { return [...prevdata, { ProductSizeId: ProductSizeId, Product: row.Proizvod, Sizes: row.Sizes, Quantity: "", Checked: false}] });
    setSearchedProduct("");
    setSearchBoxData([]);
  }
const isMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);


  return (
    <div className={DashboardCss.search}>
<input
  type="text"
  value={searchedProduct}
  placeholder="Search products..."
  onChange={(e) => searchProducts(e.target.value, 0)}
  onFocus={(e) => {
    if (isMobile() && formRef?.current) {
      // Scroll to input's position inside the popup
      setTimeout(() => {
        const inputRect = e.target.getBoundingClientRect();
        const formRect = formRef.current.getBoundingClientRect();
        const scrollOffset = inputRect.top - formRect.top - 20; // optional margin above

        formRef.current.scrollBy({ top: scrollOffset, behavior: "smooth" });
      }, 250); // Delay to wait for keyboard to open
    }
  }}
  onBlur={() => {
    if (isMobile() && formRef?.current) {
      // Optional: reset scroll position
      formRef.current.scrollBy({ top: -formRef.current.scrollTop, behavior: "smooth" });
    }
  }}
/>


                  <p><span>{createSpecError}</span><span>{createSpecSuccess}</span></p>
                  {searchBoxData.length > 0 && (<div onScroll={(e) => loadMoreProducts(e)} className={DashboardCss.searchBox}>
                    {searchBoxData.map((product) => ( <div key={product.ProductSizeId} onClick={() => renderProduct(product.ProductSizeId)} className={DashboardCss.product}><span>{product.Proizvod} {product.Sizes}</span></div> ))}
                  </div>)}
                </div>
  )
}

export default Search