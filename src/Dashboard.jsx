import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import NavBar from "./components/NavBar";
import CreateSpecificationForm from "./components/CreateSpecificationForm";
import BackendLink from "./components/BackendLink";

import DashboardCss from "./style/style_dashboard.module.css";
import SpecImg from "./assets/img/sheet.png";
import EditSpecificationForm from "./components/EditSpecificationForm";

export function Dashboard() {
  const [userId, setUserId] = useState(null)
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pageloading, setPageloading] = useState(true);
  const [specifications, setSpecifications] = useState([]);
  const [totalspec, setTotalspec] = useState(null);
  const [thismonthspec, setThismonthspec] = useState(null);

  const [createspecformCheck, setCreatespecformCheck] = useState(false);
  const [createspecFormSuccess, setCreatespecFormSuccess] = useState(false);

  const [editspecformId, setEditspecformId] = useState(false);


 const pageload = useCallback(async (specLoadOnly) => {
    if (!specLoadOnly)
      setPageloading(true);   

    try {
      const url = BackendLink() + "/Includes/dashboard.inc.php";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ type: "pageload" }),
      });

      const data = await response.json();

      if (data.status === "success") {
        if (!specLoadOnly) {
          setAuthenticated(true);
          setUserId(data.userId);
          setUsername(data.username);
        }
        
        setSpecifications(data.data);
        setTotalspec(data.data.length);

        const today  = new Date();
        const month  = today.getMonth();
        const year   = today.getFullYear();

        const countThisMonth = data.data.filter((item) => {
          const created = new Date(item.CreatedAt);
          return created.getMonth() === month && created.getFullYear() === year;
        }).length;

        setThismonthspec(countThisMonth);
      } else {
        setError(data.message);
        if (data.message === "Authentication failed, please log in again!") {
          setAuthenticated(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Greška pri povezivanju sa serverom");
    } finally {
      setPageloading(false);
    }
  }, []);

   
  useEffect(() => {
    pageload(false);
  }, [pageload]); 

  useEffect(() => {
  const shouldBlockScroll = createspecformCheck || editspecformId;

  if (shouldBlockScroll) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto"; // Clean up if component unmounts
  };
}, [createspecformCheck, editspecformId]);

  if (pageloading) {
    return null;
  }
  return (
    <>
      <NavBar username={username} />
      <section className={DashboardCss.container}>
        <p className={DashboardCss.error}>{error}</p>
        {authenticated && (
          <>
            <h1 className={DashboardCss.title}>Dashboard</h1>
            <div className={DashboardCss.createspec}>
              <div>
                <p>Total number of specifications</p>
                <span>{totalspec}</span>
              </div>
              <div>
                <p>Create a specification</p>
                <button  onClick={() => setCreatespecformCheck(true)}><FontAwesomeIcon icon={faPlus}/></button>
              </div>
              <div>
                <p>Specifications created this month</p>
                <span>{thismonthspec}</span>
              </div>
            </div>
            {specifications.length > 0 && (<>
              <p className={DashboardCss.allspec_p}>All specifications</p>
              <div className={DashboardCss.allspec}>
                {specifications.map((spec, index) => (
                  <div key={index} onClick={() => setEditspecformId(spec.Id)}>
                    <div className={DashboardCss.creationinfo}>
                      <p>{spec.CreatedAt}</p>
                      <p>
                        <span><FontAwesomeIcon icon={faCircleDot} /></span>{" "}
                        {spec.Visibility === 1 ? "public" : "private"}
                      </p>
                    </div>
                    <h3>{spec.Name || "Untitled"}</h3>
                    <img src={SpecImg} alt="Spec" />
                  </div>
                ))}
              </div></>
            )}

            {createspecformCheck && <CreateSpecificationForm DashboardCss={DashboardCss} setCreatespecformCheck={setCreatespecformCheck} setCreatespecFormSuccess={setCreatespecFormSuccess}/>}
            {editspecformId && <EditSpecificationForm DashboardCss={DashboardCss} editspecformId={editspecformId} setEditspecformId={setEditspecformId} pageload={pageload}/>}
            {createspecFormSuccess && (
              <div className={DashboardCss.successSpecificationPopup}>
                <h3>Successfully inserted a specification</h3>
                <button onClick={() => {setCreatespecFormSuccess(false); pageload(true);}}><FontAwesomeIcon icon={faCheck} /></button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
