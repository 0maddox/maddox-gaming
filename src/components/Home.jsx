import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  // Sample data - replace with your actual data
  const tournaments = [
    {
      id: 1,
      title: "Summer Gaming Championship",
      image: "/tournament1.jpg",
      description: "Join the biggest gaming event of the summer. $10,000 prize pool!",
      date: "2024-07-15",
      participants: "128/256",
      game: "League of Legends"
    },
    // Add more tournaments...
  ];

  const products = [
    {
      id: 1,
      name: "Pro Gaming Mouse",
      image: "/mouse.jpg",
      price: 59.99,
      description: "High-precision gaming mouse with customizable RGB",
      category: "Hardware"
    },
    // Add more products...
  ];

  const content = [
    {
      id: 1,
      title: "Top 10 Gaming Strategies",
      image: "/content1.jpg",
      type: "Article",
      author: "Gaming Pro",
      readTime: "5 min"
    },
    // Add more content...
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Maddox Gaming</h1>
          <p>Your ultimate destination for gaming tournaments, gear, and content</p>
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="section tournaments-section">
        <div className="section-header">
          <h2>Upcoming Tournaments</h2>
          <Link to="/tournaments" className="view-all">View All</Link>
        </div>
        <div className="tournaments-grid">
          <div className="scroll-container">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-image">
                  <img src={tournament.image} alt={tournament.title} />
                  <div className="tournament-date">{tournament.date}</div>
                </div>
                <div className="tournament-info">
                  <h3>{tournament.title}</h3>
                  <p>{tournament.description}</p>
                  <div className="tournament-meta">
                    <span>{tournament.game}</span>
                    <span>{tournament.participants}</span>
                  </div>
                  <Link to={`/tournaments/${tournament.id}`} className="join-button">
                    Join Tournament
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/shop" className="view-all">View All</Link>
        </div>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-price">${product.price}</div>
                <Link to={`/shop/${product.id}`} className="buy-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="section content-section">
        <div className="section-header">
          <h2>Latest Content</h2>
          <Link to="/content" className="view-all">View All</Link>
        </div>
        <div className="content-grid">
          {content.map(item => (
            <div key={item.id} className="content-card">
              <div className="content-image">
                <img src={item.image} alt={item.title} />
                <div className="content-type">{item.type}</div>
              </div>
              <div className="content-info">
                <h3>{item.title}</h3>
                <div className="content-meta">
                  <span>{item.author}</span>
                  <span>{item.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home; 