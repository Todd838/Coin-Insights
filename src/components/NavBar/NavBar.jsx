import React, {useContext, useState, useEffect, useRef } from 'react'
import './NavBar.css'
import arrow_icon from '../../assets/arrow_icon.png'
import { CoinContext } from '../../context/CoinContext'
import {Link, useNavigate} from 'react-router-dom'
import { auth } from '../../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

const NavBar = ({ userName }) => {
    const { setCurrency } = useContext(CoinContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [displayName, setDisplayName] = useState('Guest');
    const [profilePic, setProfilePic] = useState(null);
    const [avatarType, setAvatarType] = useState('default'); // default, upload, avatar, custom
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Track auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                setDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
                
                // Check for custom avatar options in localStorage
                const uploadedImage = localStorage.getItem(`profileImage_${user.uid}`);
                const selectedAvatar = localStorage.getItem(`profileAvatar_${user.uid}`);
                const customAvatar = localStorage.getItem(`customAvatar_${user.uid}`);
                
                if (customAvatar) {
                    setAvatarType('custom');
                    setProfilePic(JSON.parse(customAvatar));
                } else if (uploadedImage) {
                    setAvatarType('upload');
                    setProfilePic(uploadedImage);
                } else if (selectedAvatar) {
                    setAvatarType('avatar');
                    setProfilePic(JSON.parse(selectedAvatar));
                } else if (user.photoURL) {
                    setAvatarType('google');
                    setProfilePic(user.photoURL);
                } else {
                    setAvatarType('default');
                    setProfilePic(null);
                }
            } else {
                setDisplayName('Guest');
                setAvatarType('default');
                setProfilePic(null);
            }
        });
        return () => unsubscribe();
    }, []);

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
            <ul>
                <Link to={'/coingecko'}> <li>CoinGecko</li> </Link>
                <Link to={'/discovered'}> <li>Onchain/Dex</li> </Link>
                <Link to={'/watchlist'}> <li>My Watchlist</li> </Link>
                <Link to={'/live-alerts'}> <li>Live Alerts</li> </Link>
                <Link to={'/coinbase-listings'}> <li>CoinBase</li> </Link>
            </ul>
            <div className="nav-right">
                <select onChange={currencyHandler}>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="inr">INR</option>
                </select>
                
                <div className="user-profile-section" ref={menuRef}>
                    <div className="profile-trigger" onClick={toggleMenu}>
                        <div className="profile-avatar">
                            {avatarType === 'custom' && profilePic ? (
                                <img src={`https://avataaars.io/?avatarStyle=Transparent&topType=${profilePic.topType}&accessoriesType=${profilePic.accessoriesType}&hairColor=${profilePic.hairColor}&facialHairType=${profilePic.facialHairType}&clotheType=${profilePic.clotheType}&clotheColor=${profilePic.clotheColor}&eyeType=${profilePic.eyeType}&eyebrowType=${profilePic.eyebrowType}&mouthType=${profilePic.mouthType}&skinColor=${profilePic.skinColor}`} alt="Profile" />
                            ) : avatarType === 'upload' && profilePic ? (
                                <img src={profilePic} alt="Profile" />
                            ) : avatarType === 'avatar' && profilePic ? (
                                <div className="profile-initial" style={{ backgroundColor: profilePic.color }}>
                                    <span style={{ fontSize: '20px' }}>{profilePic.emoji}</span>
                                </div>
                            ) : avatarType === 'google' && profilePic ? (
                                <img src={profilePic} alt="Profile" />
                            ) : (
                                <div className="profile-initial">{displayName[0].toUpperCase()}</div>
                            )}
                        </div>
                        <span className="profile-name">{displayName}</span>
                        <svg 
                            className={`dropdown-arrow ${menuOpen ? 'open' : ''}`} 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12"
                        >
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                    </div>
                    
                    {menuOpen && (
                        <div className="profile-dropdown">
                            {currentUser ? (
                                <>
                                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                        <div className="dropdown-item">
                                            <span className="dropdown-icon">👤</span>
                                            View Profile
                                        </div>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <div className="dropdown-item" onClick={handleLogout}>
                                        <span className="dropdown-icon">🚪</span>
                                        Sign Out
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth?mode=signin" onClick={() => setMenuOpen(false)}>
                                        <div className="dropdown-item">
                                            <span className="dropdown-icon">🔑</span>
                                            Sign In
                                        </div>
                                    </Link>
                                    <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)}>
                                        <div className="dropdown-item">
                                            <span className="dropdown-icon">✨</span>
                                            Sign Up
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBar;