import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.scss";
import useAuthStore from "../../store/useAuthStore";

function Navbar() {

    const { user, logout } = useAuthStore();

    const [open, setOpen] = useState(false);
    const location = useLocation();

    // Close menu when location changes
    useEffect(() => {
        setOpen(false);
    }, [location]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const toggleMenu = () => {
        setOpen(prev => !prev);
    };

    const closeMenu = () => {
        setOpen(false);
    };

    return (
        <>
            <nav>
                <div className="left">
                    <Link to="/" className="logo">
                        <img src="/logo.svg" alt="TGUsEstate Logo" />
                        <span>TGUsEstate</span>
                    </Link>
                    <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
                    <Link to="/list" className={location.pathname === "/list" ? "active" : ""}>Properties</Link>
                    <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About</Link>
                </div>
                <div className="right">
                    {!user ? (
                        <>
                            <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
                                Sign in
                            </Link>
                            <Link to="/register" className="register">
                                Sign up
                            </Link>
                        </>
                    ) : (
                            <Link 
                                to={user.role === 'admin' ? "/profile/admin" : "/profile"} 
                                className={location.pathname === (user.role === 'admin' ? "/profile/admin" : "/profile") ? "active" : ""}
                            >
                                {user.role === 'admin' ? 'Admin Dashboard' : 'Profile'}
                            </Link>    
                    )}
                    <div className="menuIcon">
                        <img
                            src={open ? "/close.svg" : "/menu.svg"}
                            alt={open ? "Close Menu" : "Open Menu"}
                            onClick={toggleMenu}
                        />
                    </div>
                    <div className={open ? "menu active" : "menu"}>
                        <Link to="/" onClick={closeMenu}>Home</Link>
                        <Link to="/list" onClick={closeMenu}>Properties</Link>
                        <Link to="/about" onClick={closeMenu}>About</Link>
                        
                        {user ? (
                            <>
                                <Link 
                                    to={user.role === 'admin' ? "/profile/admin" : "/profile"} 
                                    onClick={closeMenu}
                                >
                                    {user.role === 'admin' ? 'Admin Dashboard' : 'Profile'}
                                </Link>
                                
                                <Link to="/logout" onClick={() => { closeMenu(); logout(); }}>Logout</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={closeMenu}>Sign in</Link>
                                <Link to="/register" onClick={closeMenu} className="register">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <div
                className={`menu-backdrop ${open ? 'active' : ''}`}
                onClick={closeMenu}
            />
        </>
    );
}

export default Navbar;