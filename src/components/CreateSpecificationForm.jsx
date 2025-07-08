import { useState, useMemo, useEffect } from "react";
import { throttle } from "lodash";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { closestCorners, DndContext } from "@dnd-kit/core";
import { restrictToParentElement } from '@dnd-kit/modifiers';
import VisibilityDropDown from "../components/VisibilityDropDown";
import BackendLink from "./BackendLink";
import { Task } from "./Task/Task";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function CreateSpecificationForm({ DashboardCss, setCreatespecformCheck, setCreatespecFormSuccess }){
    const [specName, setSpecName] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [searchedProduct, setSearchedProduct] = useState("");
    const [searchBoxData, setSearchBoxData] = useState([]);
    const [createSpecError, setCreateSpecError] = useState("");
    const [data, setData] = useState([]);
    const [price, setPrice] = useState("");

    const handleInputChange = (e, type) => {
        switch(type){
            case "specName":
                setSpecName(e.target.value);
            break;
        }
    }

    
    const searchProducts = async (product, offset) => {
  
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

const loadMoreProducts = useMemo(() => 
    throttle((e) => {
      const el = e.target;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        searchProducts(searchedProduct, searchBoxData.length);
      }
    }, 300), 
  [searchedProduct, searchBoxData.length]);

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

  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (active.id === over.id) return;
    setData((prevData) => {
      const originalPos = data.findIndex(item => item.ProductSizeId === active.id);
      const newPos = data.findIndex(item => item.ProductSizeId === over.id);

      return arrayMove(data, originalPos, newPos)
    })
  }



 const createSpecification = async () => {
    if(price.trim() === "" || specName.trim() === "" || selectedOption === null){
      setCreateSpecError("Please fill all fields, products are optional");
      return;
    }
    setCreateSpecError("");

    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const headers = {
        "Accept": "application/json",
        "Content-type": "application/json",
      };
      const formattedData = {
        type: "createSpecification",
        specName: specName,
        visibility: selectedOption.id,
        products: data.map(({Checked, ...rest}, index) => {return {...rest, Order: index + 1}}),
        price: price
      };
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(formattedData)
      });
      const responseData = await response.json();
      if (responseData.status === "success") {
        setCreatespecformCheck(false);
        setCreatespecFormSuccess(true);
      } else {
        setCreateSpecError(responseData.message);
      }
    } catch (err) {
      console.error(err);
      setCreateSpecError("An error occurred while creating the specification.");
    }
 }

    return(
        <div className={DashboardCss.createspecform}>
          <h1>Create specification</h1>
                <button className={DashboardCss.closeform} onClick={() => {setCreatespecformCheck(false); setSearchBoxData([])}}><FontAwesomeIcon icon={faXmark}/></button>
                <div className={DashboardCss.basicspecinfo}>
                  <input type="text" value={specName} onChange={(e) => handleInputChange(e, "specName")} placeholder="Specification name" />
                  <VisibilityDropDown DashboardCss={DashboardCss} selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
                </div>
                <div className={DashboardCss.search}>
                  <input type="text" value={searchedProduct} placeholder="Search products..." onChange={(e) => searchProducts(e.target.value, 0)}/>
                  <p>{createSpecError}</p>
                  {searchBoxData.length > 0 && (<div onScroll={(e) => loadMoreProducts(e)} className={DashboardCss.searchBox}>
                    {searchBoxData.map((product) => ( <div key={product.ProductSizeId} onClick={() => renderProduct(product.ProductSizeId)} className={DashboardCss.product}><span>{product.Proizvod} {product.Sizes}</span></div> ))}
                  </div>)}
                </div>
                {data.length > 0 && (<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners} modifiers={[restrictToParentElement]}>
                  <div className={DashboardCss.column}>
                    <SortableContext items={data.map(item => item.ProductSizeId)} strategy={verticalListSortingStrategy}>
                      {data.map((item) => (
                        <Task key={item.ProductSizeId} DashboardCss={DashboardCss}  Product={item.Product} Sizes={item.Sizes} ProductSizeId={item.ProductSizeId} Index={data.findIndex(p => p.ProductSizeId === item.ProductSizeId) + 1} Data={data} setData={setData} />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>)}
                <div className={DashboardCss.specificationfooter}>
                  <button disabled={!data.filter(item => item.Checked).length > 0} onClick={() => {setData((prevData) => prevData.filter(item => !item.Checked))}}>delete</button>
                  <div className={DashboardCss.pricediv}>
                    <input id="price" type="number" className={DashboardCss.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price"/>
                    <label htmlFor="price">€</label>
                  </div>
                </div>
                <button className={DashboardCss.createspecbtn} onClick={createSpecification}>Create</button>
              </div>
    )
}

export default CreateSpecificationForm;