import React, { useState, useMemo, useEffect, useRef } from "react";
import { throttle } from "lodash";
import BackendLink from "../BackendLink";

function Search({ DashboardCss, createSpecError, setCreateSpecError, createSpecSuccess, data, setData }) {
  const [searchedProduct, setSearchedProduct] = useState("");
  const [searchBoxData, setSearchBoxData] = useState([]);
  const lastOffsetRef = useRef(null);

  const isMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const searchProducts = async (product, offset) => {
    if (offset === 0) {
      lastOffsetRef.current = null;
    }

    setSearchedProduct(product);

    if (product.trim() === "") {
      setSearchBoxData([]);
      return;
    }

    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const headers = {
        Accept: "application/json",
        "Content-type": "application/json",
      };
      const payload = {
        type: "searchProducts",
        product: product,
        offset: offset,
      };
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();

      if (responseData.status === "success") {
        if (offset === 0) {
          setSearchBoxData(responseData.data);
        } else {
          setSearchBoxData((prevData) => [...prevData, ...responseData.data]);
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
  };

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
    if (data.some((item) => item.ProductSizeId === ProductSizeId)) return;

    const row = searchBoxData.find((item) => item.ProductSizeId === ProductSizeId);
    if (!row) return;

    setData((prevData) => [
      ...prevData,
      {
        ProductSizeId: ProductSizeId,
        Product: row.Proizvod,
        Sizes: row.Sizes,
        Quantity: "",
        Checked: false,
      },
    ]);
    setSearchedProduct("");
    setSearchBoxData([]);
  };

  return (
    <div className={DashboardCss.search}>
      <input
        type="text"
        value={searchedProduct}
        placeholder="Search products..."
        onChange={(e) => searchProducts(e.target.value, 0)}
        onFocus={(e) => {
          setTimeout(() => {
            const inputTop = e.target.getBoundingClientRect().top;
            const offset = inputTop - 100;
            window.scrollBy({ top: offset, behavior: "smooth" });
          }, 300); // Сачекај да тастатура искочи
        }}
      />
      <p>
        <span>{createSpecError}</span>
        <span>{createSpecSuccess}</span>
      </p>

      {searchBoxData.length > 0 && (
        <div
          onScroll={(e) => loadMoreProducts(e)}
          className={`${DashboardCss.searchBox} ${isMobile() ? "searchBoxMobile" : ""}`}
        >
          {searchBoxData.map((product) => (
            <div
              key={product.ProductSizeId}
              onClick={() => renderProduct(product.ProductSizeId)}
              className={DashboardCss.product}
            >
              <span>
                {product.Proizvod} {product.Sizes}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
