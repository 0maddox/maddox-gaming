// src/pages/ContentPage.js
import React, { useState, useEffect } from 'react';

function ContentPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/v1/content');
      const data = await response.json();
      setContent(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const categories = ['all', 'news', 'tutorials', 'videos', 'blogs'];

  return (
    <div className="content-page">
      <div className="content-hero">
        <h1>Gaming Content Hub</h1>
        <p>Stay updated with the latest gaming news and tutorials</p>
      </div>

      <div className="content-filters">
        {categories.map(category => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="content-grid">
          {content
            .filter(item => activeCategory === 'all' || item.category === activeCategory)
            .map(item => (
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
                  <button className="read-more-btn">Read More</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default ContentPage;
