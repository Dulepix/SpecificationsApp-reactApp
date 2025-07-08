import { useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import NavBarCss from "../style/style_navbar.module.css";

import Logo from "../assets/img/Logo.png";

function NavBar(props) {
    const navbarRef = useRef(null);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const shownavbar = () => {
        navbarRef.current.classList.toggle(NavBarCss.active);
        setIsNavOpen(prevState => !prevState);
    };

    return (
        <nav className={NavBarCss.nav}>
            <div>
                <a className={NavBarCss.logo} href="/"><img src={Logo} alt="Logo" /></a>
                <ul ref={navbarRef}>
                    <li><a href="home">Home</a></li>
                    <li><a href="dashboard">Dashboard</a></li>
                    <li><a href="explore">Explore</a></li>
                    <li><a href="contact">Contact</a></li>
                </ul>
                <button onClick={shownavbar}>
                    <FontAwesomeIcon icon={isNavOpen ? faXmark : faBars} />
                </button>
                {props.username ? (
                    <a className={NavBarCss.profile} href="profile">{props.username}</a>
                ) : (
                    <a className={NavBarCss.login} href="login">Login</a>
                )}

            </div>
        </nav>
    );
}

export default NavBar;
