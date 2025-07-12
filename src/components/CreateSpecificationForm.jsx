import { useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import VisibilityDropDown from "../components/VisibilityDropDown";
import BackendLink from "./BackendLink";
import DndContextSection from "./Task/DndContextSection";
import Search from "./Task/Search";


function CreateSpecificationForm({ DashboardCss, setCreatespecformCheck, setCreatespecFormSuccess }){
    const [specName, setSpecName] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [createSpecError, setCreateSpecError] = useState("");
    const [data, setData] = useState([]);
  const [price, setPrice] = useState("");

    

const formRef = useRef(null);



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
        visibility: selectedOption,
        products: data.map(({Checked, Product, Sizes, ...rest}, index) => {return {...rest, Order: index + 1}}),
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
                <button className={DashboardCss.closeform} onClick={() => {setCreatespecformCheck(false)}}><FontAwesomeIcon icon={faXmark}/></button>
                <div className={DashboardCss.basicspecinfo}>
                  <input type="text" value={specName} onChange={(e) => setSpecName(e.target.value)} placeholder="Specification name" />
                  <VisibilityDropDown DashboardCss={DashboardCss} selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
                </div>
                <Search DashboardCss={DashboardCss} createSpecError={createSpecError} setCreateSpecError={setCreateSpecError} data={data} setData={setData} formRef={formRef}/>
                {data.length > 0 && (<DndContextSection DashboardCss={DashboardCss} data={data} setData={setData} />)}
                <div className={DashboardCss.specificationfooter}>
                  <button disabled={!data.filter(item => item.Checked).length > 0} onClick={() => {setData((prevData) => prevData.filter(item => !item.Checked))}}>remove</button>
                  <div className={DashboardCss.pricediv}>
                    <input id="price" type="number" className={DashboardCss.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price"/>
                    <label htmlFor="price">€</label>
                  </div>
                </div>
                <div className={DashboardCss.stickycontainer}>
                  <button className={DashboardCss.createspecbtn} onClick={createSpecification} style={{marginLeft: "auto"}}>Create</button>
                </div>
              </div>
    )
}

export default CreateSpecificationForm;