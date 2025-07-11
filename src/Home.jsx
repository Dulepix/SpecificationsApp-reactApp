import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import BackendLink from "./components/BackendLink";


export function Home() {
    const[username, setUsername] = useState(null);
    const[pageloading, setPageloading] = useState(true);


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
    if(pageloading){
        return;
    }
    return (
        <NavBar {...(username ? { username: username } : {})} />
    );
}
