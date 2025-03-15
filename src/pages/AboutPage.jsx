import React from 'react';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Maddox Gaming</h1>
        <p>Building the future of competitive mobile gaming</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded by professional CODM player and content creator Maddox, 
            Maddox Gaming has grown from a small community into a leading platform 
            for competitive mobile gaming. Our passion for gaming and commitment 
            to excellence drives everything we do.
          </p>
        </section>

        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            To create an inclusive gaming community where players can compete, 
            learn, and grow together. We believe in the power of competitive 
            gaming to bring people together and create opportunities for players 
            worldwide.
          </p>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="/maddox-profile.jpg" alt="Maddox" />
              <h3>Maddox</h3>
              <p>Founder & CEO</p>
              <p>Professional CODM Player</p>
            </div>
            {/* Add more team members */}
          </div>
        </section>

        <section className="achievements-section">
          <h2>Our Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-card">
              <h3>1M+</h3>
              <p>Community Members</p>
            </div>
            <div className="achievement-card">
              <h3>500+</h3>
              <p>Tournaments Hosted</p>
            </div>
            <div className="achievement-card">
              <h3>$100K+</h3>
              <p>Prize Pool Distributed</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;