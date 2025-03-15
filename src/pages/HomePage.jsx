// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  // Dummy data for development
  const dummyTournaments = [
    {
      id: 1,
      name: "CODM Championship 2024",
      prize_pool: 10000,
      game_mode: "5v5",
      current_players: 45,
      max_players: 100,
      start_date: "2024-04-01",
      image_url: "/images/tournaments-bg.jpg"
    },
    {
      id: 2,
      name: "Fortnite Masters League",
      prize_pool: 5000,
      game_mode: "Battle Royale",
      current_players: 75,
      max_players: 150,
      start_date: "2024-04-15",
      image_url: "/images/default-bg.jpg"
    }
  ];

  const dummyProducts = [
    {
      id: 1,
      name: "Pro Gaming Controller",
      price: 59.99,
      discount: 10,
      description: "Professional gaming controller for mobile",
      image_url: "/images/shop-bg.jpg"
    },
    {
      id: 2,
      name: "Gaming Headset",
      price: 89.99,
      discount: 15,
      description: "High-quality gaming headset with surround sound",
      image_url: "/images/default-bg.jpg"
    }
  ];

  const dummyContent = [
    {
      id: 1,
      title: "Top 10 CODM Tips",
      type: "Guide",
      author: "Maddox",
      description: "Master these pro tips to improve your game",
      created_at: "2024-03-15",
      image_url: "/images/home-bg.jpg"
    },
    {
      id: 2,
      title: "Esports Tournament Guide",
      type: "Article",
      author: "Pro Gamer",
      description: "Everything you need to know about competitive gaming",
      created_at: "2024-03-10",
      image_url: "/images/tournaments-bg.jpg"
    }
  ];

  const [tournaments, setTournaments] = useState(dummyTournaments);
  const [products, setProducts] = useState(dummyProducts);
  const [content, setContent] = useState(dummyContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mock data initially until backend is ready
        const mockTournaments = [
          {
            id: 1,
            name: "CODM Championship 2024",
            prize_pool: 10000,
            game_mode: "5v5",
            current_players: 45,
            max_players: 100,
            start_date: "2024-04-01",
            image_url: "/images/tournament-1.jpg"
          },
          // Add more mock tournaments as needed
        ];

        const mockProducts = [
          {
            id: 1,
            name: "Pro Gaming Controller",
            price: 59.99,
            discount: 10,
            description: "Professional gaming controller for mobile",
            image_url: "/images/controller-1.jpg"
          },
          // Add more mock products as needed
        ];

        const mockContent = [
          {
            id: 1,
            title: "Top 10 CODM Tips",
            type: "Guide",
            author: "Maddox",
            description: "Master these pro tips to improve your game",
            created_at: "2024-03-15",
            image_url: "/images/guide-1.jpg"
          },
          // Add more mock content as needed
        ];

        // Use mock data for now, replace with API calls later
        setTournaments(mockTournaments);
        setProducts(mockProducts);
        setContent(mockContent);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Initialize with empty arrays if fetch fails
        setTournaments([]);
        setProducts([]);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading amazing content...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Level Up Your Game with Maddox Gaming!</h1>
          <p>Join the ultimate gaming community for tournaments, gear, and content</p>
          <Link to="/tournaments" className="cta-button">
            Join a Tournament
          </Link>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="quick-nav">
        <Link to="/shop" className="nav-card">
          <i className="fas fa-shopping-cart"></i>
          <span>Shop</span>
        </Link>
        <Link to="/tournaments" className="nav-card">
          <i className="fas fa-trophy"></i>
          <span>Tournaments</span>
        </Link>
        <Link to="/content" className="nav-card">
          <i className="fas fa-newspaper"></i>
          <span>Content</span>
        </Link>
        <Link to="/about" className="nav-card">
          <i className="fas fa-info-circle"></i>
          <span>About</span>
        </Link>
        <Link to="/contact" className="nav-card">
          <i className="fas fa-envelope"></i>
          <span>Contact</span>
        </Link>
      </section>

      {/* Featured Tournaments */}
      <section className="featured-tournaments">
        <div className="section-header">
          <h2>Upcoming Tournaments</h2>
          <Link to="/tournaments" className="view-all">View All Tournaments</Link>
        </div>
        <div className="tournaments-grid">
          {tournaments && tournaments.length > 0 ? (
            tournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-image">
                  <img src={tournament.image_url} alt={tournament.name} />
                  <div className="prize-pool">${tournament.prize_pool} Prize Pool</div>
                </div>
                <div className="tournament-info">
                  <h3>{tournament.name}</h3>
                  <div className="tournament-details">
                    <span><i className="fas fa-gamepad"></i> {tournament.game_mode}</span>
                    <span><i className="fas fa-users"></i> {tournament.current_players}/{tournament.max_players}</span>
                    <span><i className="fas fa-calendar"></i> {new Date(tournament.start_date).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/tournaments/${tournament.id}`} className="join-button">
                    Join Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <i className="fas fa-trophy"></i>
              <p>No tournaments available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Top Gaming Gear</h2>
          <Link to="/shop" className="view-all">Visit Shop</Link>
        </div>
        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                  {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">${product.price}</span>
                        <span className="discounted-price">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>${product.price}</span>
                    )}
                  </div>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <i className="fas fa-shopping-cart"></i>
              <p>Products coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Content */}
      <section className="latest-content">
        <div className="section-header">
          <h2>Latest Gaming Content</h2>
          <Link to="/content" className="view-all">View All Content</Link>
        </div>
        <div className="content-grid">
          {content && content.length > 0 ? (
            content.map(item => (
              <div key={item.id} className="content-card">
                <div className="content-image">
                  <img src={item.image_url} alt={item.title} />
                  <div className="content-type">{item.type}</div>
                </div>
                <div className="content-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="content-meta">
                    <span>{item.author}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/content/${item.id}`} className="read-more-btn">
                    Read More
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <i className="fas fa-newspaper"></i>
              <p>New content coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Community Stats */}
      <section className="community-stats">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <h3>10,000+</h3>
          <p>Active Players</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-trophy"></i>
          <h3>500+</h3>
          <p>Tournaments Completed</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-dollar-sign"></i>
          <h3>$100K+</h3>
          <p>Prize Money Awarded</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;