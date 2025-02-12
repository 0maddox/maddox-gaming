import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScroll } from '../context/ScrollContext';
import defaultAvatar from '../assets/default-avatar.png';

function Navbar() {
  const { user, logout, hasPermission } = useAuth();
  const { visible } = useScroll();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={`pinterest-navbar ${visible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="nav-content">
        {/* Home Button */}
        <Link to="/" className="nav-home-btn">
          Home
        </Link>

        {/* Search Bar */}
        <form className="nav-search" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="nav-right-section">
          {user && (
            <>
              <button className="nav-icon-btn">
                <i className="fas fa-bell"></i>
              </button>
              <button className="nav-icon-btn">
                <i className="fas fa-comment-dots"></i>
              </button>
            </>
          )}

          {/* Profile/Login */}
          {user ? (
            <div className="nav-profile dropdown">
              <button className="profile-btn dropdown-toggle" data-bs-toggle="dropdown">
                <img src={user.profilePictureUrl || defaultAvatar} alt="Profile" className="profile-img" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                {hasPermission('manage_users') && (
                  <li><Link className="dropdown-item" to="/admin">Admin Dashboard</Link></li>
                )}
                <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={logout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div className="nav-login-wrapper">
              <div className="login-icon-container">
                <img src={defaultAvatar} alt="Login" className="login-icon" />
              </div>
              <Link to="/login" className="nav-login-btn">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;