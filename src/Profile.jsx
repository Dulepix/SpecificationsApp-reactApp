import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import BackendLink from "./components/BackendLink";

import { useNavigate } from "react-router-dom";

import ProfileCss from "./style/style_profile.module.css";

export function Profile(){
    const[fullname, setFullName] = useState(null);
    const[username, setUsername] = useState(null);
    const[company, setCompany] = useState(null);
    const[telnumber, setTelNumber] = useState(null);

    const[fullnameNew, setFullNameNew] = useState("");
    const[usernameNew, setUsernameNew] = useState("");
    const[companyNew, setCompanyNew] = useState("");
    const[telnumberNew, setTelNumberNew] = useState("");

    const[pageloading, setPageloading] = useState(true);

    const[success, setSuccess] = useState("");
    const[error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function validateToken(){
            try {
                const url = BackendLink() + "/Includes/profile.inc.php";
                const headers = {
                    "Accept": "application/json",
                    "Content-type": "application/json",
                };
                const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    credentials: "include",
                    body: JSON.stringify({
                        type: "load"
                    })
                });
                const responseData = await response.json();
                if(responseData.status === "success"){
                    setUsername(responseData.username)
                    setFullName(responseData.fullname);
                    setCompany(responseData.company);
                    setTelNumber(responseData.telnumber);
                }else{
                    navigate("/Login");
                }
            } catch (err) {
                console.error(err);
            }finally{
                setPageloading(false);
            }
        }
        validateToken();
    }, [])

    const saveAccountInfo = async () => {
        const fullnametoSave = fullnameNew || fullname;
        const usernametoSave = usernameNew || username;
        const companytoSave = companyNew || company;
        const telnumbertoSave = telnumberNew || telnumber;
        try {
            const url = BackendLink() + "/Includes/profile.inc.php";
            const headers = {
                "Accept": "application/json",
                "Content-type": "application/json",
            };
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                credentials: "include",
                body: JSON.stringify({
                    fullname: fullnametoSave,
                    username: usernametoSave,
                    company: companytoSave,
                    telnumber: telnumbertoSave,
                    type: "updateProfile"
                })
            });
            const responseData = await response.json();
            if(responseData.status === "success"){
                if(fullnameNew != ""){
                    setFullName(fullnametoSave);
                }
                if(usernameNew != ""){
                    setUsername(usernametoSave);
                }
                if(companyNew != ""){
                    setCompany(companytoSave);
                }
                if(telnumberNew != ""){
                    setTelNumber(telnumbertoSave);
                }
                setFullNameNew("");
                setUsernameNew("");
                setCompanyNew("");
                setTelNumberNew("");
                setError("");
                setSuccess(responseData.message);
            }else{
                setError(responseData.message);
            }
        } catch (err) {
            console.error(err);
        }
    }

    if(pageloading){
        return;
    }
    return (
        <>
            <NavBar {...(username ? { username: username } : {})} />
            <section className={ProfileCss.sekcija}>
                <h1>Account details</h1>
                <div className={ProfileCss.container}>
                    <div>
                        <label htmlFor="1">Full name:</label>
                        <input type="text" id="1" placeholder={fullname} value={fullnameNew} onChange={(e) => setFullNameNew(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="1">Username:</label>
                        <input type="text" id="1" placeholder={username} value={usernameNew} onChange={(e) => setUsernameNew(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="1">Company Name:</label>
                        <input type="text" id="1" placeholder={company} value={companyNew} onChange={(e) => setCompanyNew(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="1">Mobile number:</label>
                        <input type="text" id="1" placeholder={telnumber} value={telnumberNew} onChange={(e) => setTelNumberNew(e.target.value)}/>
                    </div>
                    <p className={ProfileCss.error}>{error}</p>
                    <p className={ProfileCss.success}>{success}</p>

                    {(fullnameNew != "" || usernameNew != "" || companyNew != "" || telnumberNew != "") && (
                        <button onClick={() => saveAccountInfo()}>Submit</button>
                    )}

                </div>
            </section>
        </>
    );
}