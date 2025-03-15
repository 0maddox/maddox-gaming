// src/pages/ContactPage.js
import React, { useState } from 'react';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Get in touch with our team</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <i className="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>support@maddoxgaming.com</p>
          </div>
          <div className="info-card">
            <i className="fab fa-discord"></i>
            <h3>Discord</h3>
            <p>Join our community</p>
            <a href="https://discord.gg/maddoxgaming" target="_blank" rel="noopener noreferrer">
              Maddox Gaming Discord
            </a>
          </div>
          <div className="info-card">
            <i className="fas fa-headset"></i>
            <h3>Support</h3>
            <p>24/7 Customer Service</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {status === 'success' && (
            <div className="alert success">Message sent successfully!</div>
          )}
          {status === 'error' && (
            <div className="alert error">Error sending message. Please try again.</div>
          )}

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              rows="5"
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>

      <div className="social-links">
        <h3>Follow Us</h3>
        <div className="social-icons">
          <a href="https://twitter.com/maddoxgaming" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://facebook.com/maddoxgaming" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com/maddoxgaming" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://youtube.com/maddoxgaming" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
