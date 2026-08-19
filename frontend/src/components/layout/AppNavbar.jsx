import {Container,Nav,Navbar,Button,} from "react-bootstrap";

import {Link,useLocation,useNavigate,} from "react-router-dom";

import {FaTachometerAlt,FaBook,FaProjectDiagram,FaHistory,FaStickyNote,FaSignOutAlt,FaCode,} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "./AppNavbar.css";


const NAV_ITEMS = [
    {
        path: "/dashboard",
        label: "Dashboard",
        icon: FaTachometerAlt,
    },
    {
        path: "/skills",
        label: "Skills",
        icon: FaBook,
    },
    {
        path: "/projects",
        label: "Projects",
        icon: FaProjectDiagram,
    },
    {
        path: "/daily-logs",
        label: "Daily Logs",
        icon: FaHistory,
    },
    {
        path: "/notes",
        label: "Notes",
        icon: FaStickyNote,
    },
];


function AppNavbar() {

    const {
        auth,
        logout,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();


    const handleLogout = () => {

        logout();

        navigate("/login", {
            replace: true,
        });
    };


    const isActive = (path) => {

        return location.pathname === path;
    };


    return (

        <Navbar
            expand="lg"
            className="devtrack-navbar"
        >

            <Container>
                <Navbar.Brand
                    as={Link}
                    to="/dashboard"
                    className="devtrack-brand"
                >

                    <span className="brand-icon">
                        <FaCode />
                    </span>

                    <span className="brand-text">
                        Dev<span>Track</span>
                    </span>

                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="devtrack-navbar"
                    className="devtrack-navbar-toggle"
                />

                <Navbar.Collapse
                    id="devtrack-navbar"
                >

                    <Nav className="devtrack-nav mx-lg-auto">

                        {NAV_ITEMS.map(
                            ({
                                path,
                                label,
                                icon: Icon,
                            }) => (

                                <Nav.Link
                                    key={path}
                                    as={Link}
                                    to={path}
                                    className={
                                        `devtrack-nav-link ${
                                            isActive(path)
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                >

                                    <Icon className="nav-item-icon" />

                                    <span>
                                        {label}
                                    </span>

                                </Nav.Link>

                            )
                        )}

                    </Nav>

                    <div className="devtrack-user-section">
                        <div className="devtrack-user">

                            <div className="devtrack-avatar">
                                {
                                    (
                                        auth?.name ||
                                        "D"
                                    )
                                        .charAt(0)
                                        .toUpperCase()
                                }
                            </div>


                            <div className="devtrack-user-info">

                                <span className="devtrack-user-label">
                                    Welcome back
                                </span>

                                <span className="devtrack-user-name">
                                    {auth?.name || "Developer"}
                                </span>

                            </div>

                        </div>


                        <Button
                            variant="outline-danger"
                            className="devtrack-logout"
                            onClick={handleLogout}
                        >

                            <FaSignOutAlt />

                            <span>
                                Logout
                            </span>

                        </Button>

                    </div>

                </Navbar.Collapse>

            </Container>

        </Navbar>
    );
}


export default AppNavbar;