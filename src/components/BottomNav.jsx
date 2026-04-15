import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();

  const items = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/community', label: 'Community' },
    { to: '/checkout', label: 'Cart' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active' : ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
