import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
import VisibilityDropDown from "../components/VisibilityDropDown";
import BackendLink from "./BackendLink";
import DndContextSection from "./Task/DndContextSection";
import Search from "./Task/Search";

function EditSpecificationForm({DashboardCss, editspecformId, setEditspecformId, pageload}) {
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

  const [confimDelete, setConfirmDelete] = useState(false);
  const [confirmDownload, setConfirmDownload] = useState(false)

  const [downloadEmail, setDownloadEmail] = useState("")

  const formRef = useRef(null);
  

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
        pageload(true);
      } else {
        setEditSpecError(responseData.message);
      }
    } catch (err) {
      console.error(err);
      setEditSpecError("An error occurred while creating the specification.");
    }
 }

  const deleteSpecification = async () => {
    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const headers = {
        "Accept": "application/json",
        "Content-type": "application/json",
      };
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ type: "deleteSpecification", editspecformId: editspecformId })
      });
      const responseData = await response.json();
      if (responseData.status === "success") {
        setEditspecformId(null);
        pageload(true);
      } else {
        setEditSpecError(responseData.message);
      }
    } catch (err) {
      console.error(err);
      setEditSpecError("An error occurred while deleting the specification.");
    }
  }

const downloadSpec = async () => {
  try {
    const response = await fetch(BackendLink() + "/Includes/dashboard.inc.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: "downloadSpecification", editspecformId }),
    });

    // ❗ Ako nije 2xx status (npr. 500), pročitaj tekst greške
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      setEditSpecError(errorText || "Došlo je do greške pri preuzimanju fajla.");
      return;
    }

    // ✅ Ako je sve OK, napravi Blob i preuzmi
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `specifikacija_${editspecformId}.xlsx`;
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    setEditSpecError("Došlo je do greške pri preuzimanju fajla.");
  }
};




  const sendSpecOnEmail = async () => {
    console.log("poslato")
  }



  return(
        <div ref={formRef} className={DashboardCss.createspecform}>
          <h1>Edit specification</h1>
                <button className={DashboardCss.closeform} onClick={() => {setEditspecformId(null)}}><FontAwesomeIcon icon={faXmark}/></button>
                <div className={DashboardCss.basicspecinfo}>
                  <input type="text" value={specName} onChange={(e) => setSpecName(e.target.value)} placeholder="Specification name" />
                  <VisibilityDropDown DashboardCss={DashboardCss} selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
                </div>
                <Search DashboardCss={DashboardCss} createSpecError={editSpecError} setCreateSpecError={setEditSpecError} createSpecSuccess={editSpecFormSuccess} data={data} setData={setData} formRef={formRef}/>
                {data.length > 0 && (<DndContextSection DashboardCss={DashboardCss} data={data} setData={setData} />)}
                <div className={DashboardCss.specificationfooter}>
                  <button disabled={!data.filter(item => item.Checked).length > 0} onClick={() => {setData((prevData) => prevData.filter(item => !item.Checked))}}>remove</button>
                  <div className={DashboardCss.pricediv}>
                    <input id="price" type="number" className={DashboardCss.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price"/>
                    <label htmlFor="price">€</label>
                  </div>
                </div>
                <div className={DashboardCss.stickycontainer}>
                  <button className={DashboardCss.deletespecbtn} onClick={() => {setConfirmDelete(true); setConfirmDownload(false);}}>Delete</button>
                    {confimDelete && (
                      <div className={DashboardCss.deletespec}>
                        <p>Are you sure you want to delete it?</p>
                        <div className={DashboardCss.popupbuttons}>
                          <button onClick={() => deleteSpecification()}>Yes</button>
                          <button onClick={() => setConfirmDelete(false)}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {confirmDownload && (
                      <div className={DashboardCss.downloadspec}>
                          <button onClick={() => downloadSpec()}>Just download</button><hr />
                          <input type="email" name="email" value={downloadEmail} onChange={(e) => setDownloadEmail(e.target.value)} placeholder="Email:"/>
                          <div className={DashboardCss.popupbuttons}>
                            <button onClick={() => sendSpecOnEmail()}>Send</button>
                            <button onClick={() => setConfirmDownload(false)}>Cancel</button>
                          </div>
                      </div>
                    )}
                  <button className={DashboardCss.downloadbtn} onClick={() => {setConfirmDownload(true); setConfirmDelete(false);}}><FontAwesomeIcon icon={faDownload}/></button>
                  <button className={DashboardCss.createspecbtn} onClick={saveSpecification}>Save</button>
                  </div>
                </div>   
    )
}

export default EditSpecificationForm