
// src/pages/HomePage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const navigationButtons = [
    { label: 'Go to Shop', path: '/shop' },
    { label: 'View Tournaments', path: '/tournaments' },
    { label: 'Browse Content', path: '/content' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to Maddox Gaming</h1>
        <p>Your ultimate destination for gaming products, tournaments, and content!</p>
      </header>

      <section className="homepage-sections">
        <div className="section">
          <h2>Shop</h2>
          <p>Explore our wide range of gaming products and accessories.</p>
          <Link to="/shop" className="btn">Visit Shop</Link>
        </div>

        <div className="section">
          <h2>Tournaments</h2>
          <p>Join exciting Call of Duty Mobile tournaments and compete for glory!</p>
          <Link to="/tournaments" className="btn">View Tournaments</Link>
        </div>

        <div className="section">
          <h2>Content</h2>
          <p>Check out the latest gaming news, blogs, and videos.</p>
          <Link to="/content" className="btn">Explore Content</Link>
        </div>
      </section>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {navigationButtons.map((button, index) => (
          <button
            key={index}
            onClick={() => navigate(button.path)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {button.label}
          </button>
        ))}
      </div>

      <footer className="homepage-footer">
        <p>&copy; 2025 Maddox Gaming. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;