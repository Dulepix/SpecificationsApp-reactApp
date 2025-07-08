import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import NavBar from "./components/NavBar";
import BackendLink from "./components/BackendLink";

import RegisterCss from "./style/style_signup.module.css";

export function Signup() {
  const [user, setUser] = useState("");  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");  
  const [repeatpassword, setRepeatpassword] = useState("");  
  const [error, setError] = useState("");  
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  const[usrname, setUsrname] = useState(null)
  const[pageloading, setPageloading] = useState(true);




  const handleInputChange = (e, type) => {
    switch(type){
      case "user":
        setUser(e.target.value);
        break;
      case "username":
        setUsername(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
      case "password":
        setPassword(e.target.value);
        break;
      case "repeatpassword":
        setRepeatpassword(e.target.value);
        break;
      default:
    }
  };

  const clearForm = () => {
    setUser("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRepeatpassword("");
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setLoading(true);

    try {
      const url = BackendLink() + "/react_backend/Includes/signup.inc.php";

      const headers = {
        "Accept": "application/json",
        "Content-type": "application/json"
      };
      const data = {
        user,
        username,
        email,
        password,
        repeatpassword
      };
  
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
  
      const responseData = await response.json();
      
      setLoading(false);

      if (responseData.status === 'success') {
        setError("");
        clearForm();
        openPopup();
      } else {
        setError(responseData.message);
      }
    } catch (err) {
      setLoading(false);
      setError("An error occurred while trying to submit the form.");
      console.error(err);
    }
  };

  useEffect(() => {
    async function validateToken(){
      try {
          const url = BackendLink() + "/react_backend/Includes/getusername.inc.php";
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
            setUsrname(responseData.username);
          } else {
            console.log(responseData.message);
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
    <section className={RegisterCss.container}>
      <NavBar {...(usrname ? {username: usrname} : {})}/>
      <form onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <p className={RegisterCss.error}>{error}</p>

        <div>
          <label>Full name</label>
          <input 
            type="text" 
            value={user} 
            onChange={(e) => handleInputChange(e, "user")} required
          />
        </div>
        <div>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => handleInputChange(e, "username")} required
          />
        </div>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => handleInputChange(e, "email")} required
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => handleInputChange(e, "password")} required
          />
        </div>
        <div>
          <label>Repeat password</label>
          <input 
            type="password" 
            value={repeatpassword} 
            onChange={(e) => handleInputChange(e, "repeatpassword")} required
          />
        </div>

        <p style={{ textAlign: "center" }}>
          Already have an account? Log in <a href="/login">here</a>
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {loading && (
        <div className={RegisterCss.loading_animation}>
          <svg>
            <circle cx={45} cy={45} r={45}></circle>
          </svg>
        </div>
      )}

      {isOpen && (
        <div className={RegisterCss.success}>
          <h2>Successfully signed up</h2>
          <p>Check your email to validate the account</p>
          <button onClick={closePopup}><FontAwesomeIcon icon={faCheck} /></button>
        </div>
      )}
    </section>
  );
}
