// src/pages/TournamentsPage.js
import React, { useState, useEffect } from 'react';

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/v1/tournaments');
      const data = await response.json();
      setTournaments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setLoading(false);
    }
  };

  return (
    <div className="tournaments-page">
      <div className="tournaments-hero">
        <h1>CODM Tournaments</h1>
        <p>Compete with the best players worldwide</p>
      </div>

      <div className="tournaments-tabs">
        <button 
          className={activeTab === 'upcoming' ? 'active' : ''} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Tournaments
        </button>
        <button 
          className={activeTab === 'past' ? 'active' : ''} 
          onClick={() => setActiveTab('past')}
        >
          Past Tournaments
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="tournaments-grid">
          {tournaments
            .filter(tournament => 
              activeTab === 'upcoming' 
                ? new Date(tournament.start_date) > new Date() 
                : new Date(tournament.start_date) < new Date()
            )
            .map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-image">
                  <img src={tournament.image_url} alt={tournament.name} />
                  <div className="tournament-date">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="tournament-info">
                  <h3>{tournament.name}</h3>
                  <p>{tournament.description}</p>
                  <div className="tournament-details">
                    <span>Prize Pool: ${tournament.prize_pool}</span>
                    <span>Players: {tournament.current_players}/{tournament.max_players}</span>
                  </div>
                  <button className="register-btn">Register Now</button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="tournament-registration">
        <h2>Want to organize a tournament?</h2>
        <p>Contact us to set up your own CODM tournament</p>
        <button className="contact-btn">Get in Touch</button>
      </div>
    </div>
  );
}

export default TournamentsPage;
