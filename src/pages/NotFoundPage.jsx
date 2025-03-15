// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            <i className="fas fa-home"></i> Return Home
          </Link>
          <Link to="/contact" className="contact-button">
            <i className="fas fa-envelope"></i> Contact Support
          </Link>
        </div>
      </div>
      <div className="not-found-image">
        <img src="/404-gaming.svg" alt="404 Error" />
      </div>
    </div>
  );
}

export default NotFoundPage;