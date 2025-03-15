// src/pages/ShopPage.js
import React, { useState, useEffect } from 'react';

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Fetch products from your Rails API
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <h1>Gaming Gear Shop</h1>
        <p>Level up your game with premium equipment</p>
      </div>

      <div className="shop-filters">
        <div className="category-filters">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'active' : ''}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
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
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopPage;