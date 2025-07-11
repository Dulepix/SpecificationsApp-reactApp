import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import VisibilityDropDown from "../components/VisibilityDropDown";
import BackendLink from "./BackendLink";
import DndContextSection from "./Task/DndContextSection";
import Search from "./Task/Search";

function EditSpecificationForm({DashboardCss, editspecformId, setEditspecformId}) {
  const [specName, setSpecName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [editSpecError, setEditSpecError] = useState("");
  const [editSpecFormSuccess, setEditSpecFormSuccess] = useState(false);
  const [data, setData] = useState([]);
  const [price, setPrice] = useState("");

  const [specNameOld, setSpecNameOld] = useState("");
  const [selectedOptionOld, setSelectedOptionOld] = useState(null);
  const [dataOld, setDataOld] = useState([]);
  const [priceOld, setPriceOld] = useState("");

useEffect(() => {
  const fetchData = async () => {
    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ type: "editSpecificationGet", specId: editspecformId }),
      });

      const responseData = await response.json();

      if (responseData.status === "success") {
        setSpecName(responseData.specName);
        setSelectedOption(responseData.visibility)
        setPrice(responseData.price);
        setData(responseData.data)
        setSpecNameOld(responseData.specName);
        setSelectedOptionOld(responseData.visibility)
        setPriceOld(responseData.price);
        setDataOld(responseData.data)
      } else {
        setEditSpecError(responseData.message);
      }
    } catch (error) {
      setEditSpecError("Server error or invalid response.");
    }
  };

  fetchData();
}, []);

 const saveSpecification = async () => {
    setEditSpecError("");
    setEditSpecFormSuccess("");

    if(price.trim() === priceOld && specName.trim() === specNameOld && selectedOption === selectedOptionOld && JSON.stringify(data) === JSON.stringify(dataOld)){
      setEditSpecError("You haven't made any changes to save.");
      return;
    }

    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const headers = {
        "Accept": "application/json",
        "Content-type": "application/json",
      };
      const formattedData = {
        type: "editSpecification",
        specName: specName.trim(),
        visibility: selectedOption,
        ...(JSON.stringify(data) !== JSON.stringify(dataOld) && {products: data.map(({Checked, Product, Sizes, ...rest}, index) => {return {...rest, Order: index + 1}})}),
        price: price.trim(),
        editspecformId: editspecformId
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(formattedData)
      });
      const responseData = await response.json();
      if (responseData.status === "success") {
        setPriceOld(price.trim());
        setSpecNameOld(specName.trim());
        setSelectedOptionOld(selectedOption);
        setDataOld(data);
        setEditSpecFormSuccess("Specification updated successfully");
      } else {
        setEditSpecError(responseData.message);
      }
    } catch (err) {
      console.error(err);
      setEditSpecError("An error occurred while creating the specification.");
    }
 }


  return(
        <div className={DashboardCss.createspecform}>
          <h1>Edit specification</h1>
                <button className={DashboardCss.closeform} onClick={() => {setEditspecformId(null)}}><FontAwesomeIcon icon={faXmark}/></button>
                <div className={DashboardCss.basicspecinfo}>
                  <input type="text" value={specName} onChange={(e) => setSpecName(e.target.value)} placeholder="Specification name" />
                  <VisibilityDropDown DashboardCss={DashboardCss} selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
                </div>
                <Search DashboardCss={DashboardCss} createSpecError={editSpecError} setCreateSpecError={setEditSpecError} createSpecSuccess={editSpecFormSuccess} data={data} setData={setData}/>
                {data.length > 0 && (<DndContextSection DashboardCss={DashboardCss} data={data} setData={setData} />)}
                <div className={DashboardCss.specificationfooter}>
                  <button disabled={!data.filter(item => item.Checked).length > 0} onClick={() => {setData((prevData) => prevData.filter(item => !item.Checked))}}>remove</button>
                  <div className={DashboardCss.pricediv}>
                    <input id="price" type="number" className={DashboardCss.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price"/>
                    <label htmlFor="price">€</label>
                  </div>
                </div>
                <div className={DashboardCss.stickycontainer}>
                  <button className={DashboardCss.deletespecbtn} onClick={saveSpecification}>Delete</button>
                  <button className={DashboardCss.createspecbtn} onClick={saveSpecification}>Save</button>
                </div>
                
              </div>
    )
}

export default EditSpecificationForm