import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = (sectionId) => {
    const scrollToTarget = () => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname === '/') {
      scrollToTarget();
      return;
    }

    navigate('/');
    window.setTimeout(scrollToTarget, 160);
  };

  return (
    <footer className="premium-footer">
      <div className="container-12 footer-grid">
        <div>
          <h3>Maddox Gaming</h3>
          <p>Premium gear. Competitive scenes. Real community.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            <li><button type="button" className="footer-link-btn" onClick={() => navigateToSection('products')}>Products</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => navigateToSection('tournaments')}>Tournaments</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => navigateToSection('gallery')}>Gallery</button></li>
          </ul>
        </div>

        <div>
          <h4>Socials</h4>
          <ul>
            <li><a href="https://www.tiktok.com/@maddoxgaming_ke" target="_blank" rel="noreferrer">TikTok</a></li>
            <li><a href="https://wa.me/c/254748376744" target="_blank" rel="noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
