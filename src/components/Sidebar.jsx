import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      path: '/shop',
      icon: 'fa-store',
      label: 'Shop',
      description: 'Browse and buy gaming gear'
    },
    {
      path: '/tournaments',
      icon: 'fa-trophy',
      label: 'Tournaments',
      description: 'Join competitive events'
    },
    {
      path: '/content',
      icon: 'fa-newspaper',
      label: 'Content',
      description: 'News and updates'
    },
    {
      path: '/profile',
      icon: 'fa-user',
      label: 'Profile',
      description: 'Your gaming profile'
    },
    {
      path: '/games',
      icon: 'fa-gamepad',
      label: 'Games',
      description: 'Browse available games'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
        </Link>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            title={item.description}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar; 