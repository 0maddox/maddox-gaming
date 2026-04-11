import React from 'react';
import { useLocation } from 'react-router-dom';

function PageBackground() {
  const location = useLocation();
  
  const getBackgroundImage = () => {
    switch(location.pathname) {
      case '/':
        return '/images/home-bg.jpg';
      case '/shop':
        return '/images/shop-bg.jpg';
      case '/tournaments':
        return '/images/tournaments-bg.jpg';
      case '/login':
        return '/images/login-bg.jpg';
      case '/signup':
        return '/images/signup-bg.jpg';
      default:
        return '/images/default-bg.jpg';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -2,
        opacity: 0.35,
        pointerEvents: 'none'
      }}
    />
  );
}

export default PageBackground; 