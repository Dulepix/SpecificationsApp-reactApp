import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import BackendLink from "./components/BackendLink";
import LogCss from "./style/style_signup.module.css";

export function Login(){
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState("");
    const[username, setUsername] = useState(null);
    const[pageloading, setPageloading] = useState(true);

    const navigate = useNavigate();

    const handleInputChange = (e, type) => {
        switch(type){
            case "email":
                setEmail(e.target.value);
                break;
            case "password":
                setPassword(e.target.value);
                break;
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const url = BackendLink() + "/Includes/login.inc.php";
            const headers = {
                "Accept": "application/json",
                "Content-type": "application/json"
            };
            const data = {
                email: email,
                password: password
            };

            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const responseData = await response.json();

            if(responseData.status == "success"){
                navigate("/Dashboard")
            }else{
                setError(responseData.message);
            }
        }catch (err) {
            setError("An error occurred while trying to submit the form.");
            console.error(err);
        }
    };

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
                    navigate("/dashboard");
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
        <section className={LogCss.container}>
            <NavBar {...(username ? { username: username } : {})} />
            <form onSubmit={handleSubmit}>
                <h1>Log in to your account</h1>
                <p className={LogCss.error}>{error}</p>
            
                <div>
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email"
                        autoComplete="email"
                        value={email} 
                        onChange={(e) => handleInputChange(e, "email")} 
                        required 
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => handleInputChange(e, "password")} 
                        required 
                    />
                </div>
                    <p style={{ textAlign: "center" }}>
                        Don't have an account? Sign up <a href="/signup">here</a>
                    </p>
                <button type="submit">Log In</button>
            </form>
        </section>
      );
}