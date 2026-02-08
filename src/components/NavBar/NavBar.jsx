import React, {useContext, useState, useEffect, useRef } from 'react'
import './NavBar.css'
import logo from '../../assets/logo.png'
import arrow_icon from '../../assets/arrow_icon.png'
import { CoinContext } from '../../context/CoinContext'
import {Link, useNavigate} from 'react-router-dom'
import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'

const NavBar = ({ userName }) => {
    const { setCurrency } = useContext(CoinContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const currencyHandler = (event) => {
        switch (event.target.value) {
            case 'usd':
                setCurrency({ name: 'usd', symbol: '$' });
                break;
            case 'eur':
                setCurrency({ name: 'eur', symbol: '€' });
                break;
            case 'inr':
                setCurrency({ name: 'inr', symbol: '₹' });
                break;
            default:
                setCurrency({ name: 'usd', symbol: '$' });
                break;
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className='navbar'>
            <Link to={'/'}>
                <img src={logo} alt="" className='logo' />
            </Link>
            <ul>
                <Link to={'/'}> <li>Home</li> </Link>
                <Link to={'/discovered'}> <li>Discovered</li> </Link>
                <Link to={'/live-alerts'}> <li>Live Alerts</li> </Link>
                <Link to={'/coinbase-listings'}> <li>New Listings</li> </Link>
            </ul>
            <div className="nav-right">
                <select onChange={currencyHandler}>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="inr">INR</option>
                </select>
                {!userName && (
                  <Link to="/signup">
                    <button>Sign Up <img src={arrow_icon} alt="" /></button>
                  </Link>
                )}
                {userName && (
                    <div className="user-menu" ref={menuRef}>
                        <span style={{marginLeft: 20, fontWeight: 600}}>{userName}</span>
                        <button className="menu-button" onClick={toggleMenu}>
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        {menuOpen && (
                            <div className="dropdown-menu">
                                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                    <div className="menu-item">👤 Profile</div>
                                </Link>
                                <div className="menu-item" onClick={handleLogout}>
                                    🚪 Logout
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NavBar;