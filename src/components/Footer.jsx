import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Show footer when within 100px of the bottom
      const isNearBottom = (windowHeight + scrollTop) >= (documentHeight - 100);
      setIsVisible(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const footerLinks = {
    about: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Team', path: '/team' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Safety Center', path: '/safety' },
      { name: 'Community Guidelines', path: '/guidelines' },
      { name: 'Report an Issue', path: '/report' },
      { name: 'Contact Support', path: '/contact' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Intellectual Property', path: '/ip' },
      { name: 'Gaming Guidelines', path: '/gaming-guidelines' }
    ],
    gaming: [
      { name: 'Game Library', path: '/games' },
      { name: 'Tournaments', path: '/tournaments' },
      { name: 'Leaderboards', path: '/leaderboards' },
      { name: 'Gaming News', path: '/news' },
      { name: 'Events Calendar', path: '/events' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'fa-twitter', url: 'https://twitter.com/maddoxgaming' },
    { name: 'Facebook', icon: 'fa-facebook', url: 'https://facebook.com/maddoxgaming' },
    { name: 'Instagram', icon: 'fa-instagram', url: 'https://instagram.com/maddoxgaming' },
    { name: 'Discord', icon: 'fa-discord', url: 'https://discord.gg/maddoxgaming' },
    { name: 'YouTube', icon: 'fa-youtube', url: 'https://youtube.com/maddoxgaming' },
    { name: 'Twitch', icon: 'fa-twitch', url: 'https://twitch.tv/maddoxgaming' }
  ];

  return (
    <footer className={`footer ${isVisible ? 'footer-visible' : ''}`}>
      <div className="footer-content">
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className="footer-section">
            <h5>{section.charAt(0).toUpperCase() + section.slice(1)}</h5>
            {links.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={(e) => {
                  // Prevent navigation if the route is not yet implemented
                  if (!link.path) {
                    e.preventDefault();
                    alert('Coming soon!');
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-section">
          <h5>Connect With Us</h5>
          <div className="social-links">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
              >
                <i className={`fab ${social.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} Maddox Gaming. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/sitemap">Sitemap</Link>
            <span>•</span>
            <Link to="/accessibility">Accessibility</Link>
            <span>•</span>
            <Link to="/preferences">Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
