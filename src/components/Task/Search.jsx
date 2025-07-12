import React from 'react'
import { useState, useMemo, useEffect, useRef } from "react";
import { throttle } from "lodash";
import BackendLink from "../BackendLink";


function Search({DashboardCss, createSpecError, setCreateSpecError, createSpecSuccess, data, setData, formRef}) {
    const [searchedProduct, setSearchedProduct] = useState("");
    const [searchBoxData, setSearchBoxData] = useState([]);
    const lastOffsetRef = useRef(null);
    const [keyboardIsShown, setKeyboardIsShown] = useState(false);
  const initialHeightRef = useRef(window.innerHeight);
    
   useEffect(() => {
    const interval = setInterval(() => {
      const heightNow = window.innerHeight;
      const diff = initialHeightRef.current - heightNow;

      if (diff > 150 && !keyboardIsShown) {
        setKeyboardIsShown(true);
      } else if (diff < 100 && keyboardIsShown) {
        setKeyboardIsShown(false);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [keyboardIsShown]);

  // 🎯 Dodavanje margin-bottom formi kada je tastatura prikazana
  useEffect(() => {
    if (formRef?.current) {
      formRef.current.style.marginTop = keyboardIsShown ? "-200px" : "0px";
    }
  }, [keyboardIsShown, formRef]);

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
      />

                  <p><span>{createSpecError}</span><span>{createSpecSuccess}</span></p>
                  {searchBoxData.length > 0 && (<div onScroll={(e) => loadMoreProducts(e)} className={DashboardCss.searchBox}>
                    {searchBoxData.map((product) => ( <div key={product.ProductSizeId} onClick={() => renderProduct(product.ProductSizeId)} className={DashboardCss.product}><span>{product.Proizvod} {product.Sizes}</span></div> ))}
                  </div>)}
                </div>
  )
}

export default Search