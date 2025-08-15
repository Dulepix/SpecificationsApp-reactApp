import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import BackendLink from "./components/BackendLink";

import person from "./assets/img/person.png";

import HomeCss from "./style/style_home.module.css";


export function Home() {
    const[username, setUsername] = useState(null);
    const[pageloading, setPageloading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function validateToken(){
            try {
                const url = BackendLink() + "/Includes/getusername.inc.php";
                const headers = {
                    "Accept": "application/json",
                    "Content-type": "application/json",
                };
                const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    credentials: "include",
                });
                const responseData = await response.json();
                if(responseData.status === "success"){
                    setUsername(responseData.username)
                }
            } catch (err) {
                console.error(err);
            }finally{
                setPageloading(false);
            }
        }
        validateToken();
    }, [])

    const checkAuth = async () => {
        try {
            const url = BackendLink() + "/Includes/getusername.inc.php";
            const headers = {
                "Accept": "application/json",
                "Content-type": "application/json",
            };
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                credentials: "include",
            });
            const responseData = await response.json();
            if(responseData.status === "success"){
                navigate("/Dashboard");
            }else{
                navigate("/Login");
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
            <section className={HomeCss.sekcija}>
                <div>
                    <h1>Welcome to the Home Page</h1>
                    <p>We are pushing the limits and bringing our customers the best, most practical version of the app yet. Want to try it? Just create an account and let the magic happen.</p>
                    <button onClick={checkAuth}>Start Now</button>
                </div>
                <div>
                    <img src={person} alt="" />
                </div>
            </section>
        </>
    );
}
