import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

//images

import SucEnv from "./assets/img/Successful_envelope.png";
import FaiEnv from "./assets/img/Failed_envelope.png";

import ValidateCss from"./style/style_validate.module.css";

export function Validate() {
    const location = useLocation();
    const [text, setText] = useState("Verifying..."); 
    const [verified, setVerified] = useState(false)

    const getQueryParam = (name) => {
        const params = new URLSearchParams(location.search);
        return params.get(name);
    };

    const token = getQueryParam("token");

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = "http://localhost/react_backend/Includes/emailvalidation.inc.php";
                const headers = {
                    "Accept": "text/plain",
                    "Content-Type": "text/plain"
                };

                const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: token,
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }

                const responseData = await response.text(); 
                setText(responseData);
                
            } catch (err) {
                setText("Verification failed.");
            }
        };

        if (token) {
            verifyToken();
        } else {
            setText("Invalid token.");
        }
    }, []);

    return (
        <section className={ValidateCss.container}>
            <div>
                <h1>Validation Page</h1>
                {text == "Verified successfully" && (
                    <>
                        <img src={SucEnv}/>
                        <p>{text}</p>
                        <a href="/login">Login</a>
                    </>
                )}

                {text != "Verified successfully" && (
                    <>
                        <img src={FaiEnv}/>
                        <p>{text}, try again</p>
                    </>
                )}
            </div>
        </section>
    );
}
