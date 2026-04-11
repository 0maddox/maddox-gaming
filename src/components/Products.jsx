import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '../services/api';
import { subscribeToLiveUpdates } from '../services/realtime';

const currency = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function Products({ timing = {} }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlisted, setWishlisted] = useState({});
  const [cartFeedback, setCartFeedback] = useState({});

  const sectionDelay = timing.sectionDelay ?? 0.12;
  const sectionDuration = timing.sectionDuration ?? 0.55;
  const cardStagger = timing.cardStagger ?? 0.06;

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        const normalized = Array.isArray(response) ? response : [];
        if (mounted) {
          setProducts(normalized);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to load products right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveUpdates((event) => {
      if (!event || event.resource !== 'product') {
        return;
      }

      setProducts((prev) => {
        const current = Array.isArray(prev) ? prev : [];

        if (event.action === 'destroyed') {
          return current.filter((item) => item.id !== event.id);
        }

        const incoming = event.data;
        if (!incoming || !incoming.id) {
          return current;
        }

        const index = current.findIndex((item) => item.id === incoming.id);
        if (index === -1) {
          return [incoming, ...current];
        }

        const updated = [...current];
        updated[index] = { ...updated[index], ...incoming };
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const getProductBadge = (product) => {
    if (typeof product.stock === 'number' && product.stock <= 5) {
      return 'HOT';
    }

    const createdAt = product.created_at ? new Date(product.created_at).getTime() : 0;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (createdAt && Date.now() - createdAt < sevenDays) {
      return 'NEW';
    }

    return null;
  };

  const getRating = (product) => {
    if (typeof product.stock === 'number') {
      return product.stock > 10 ? 5 : 4;
    }
    return 4;
  };

  const formatPrice = (value) => {
    if (typeof value === 'number') {
      return currency.format(value);
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? currency.format(parsed) : 'KES -';
  };

  const toggleWishlist = (productId) => {
    setWishlisted((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const addToCart = (product) => {
    const cartKey = 'maddox_cart';
    const rawCart = localStorage.getItem(cartKey);
    const parsedCart = rawCart ? JSON.parse(rawCart) : [];

    const itemToAdd = {
      id: product.id,
      name: product.name || 'Untitled product',
      price: product.price,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    const existingIndex = parsedCart.findIndex((item) => item.id === itemToAdd.id);
    if (existingIndex >= 0) {
      parsedCart[existingIndex].quantity += 1;
    } else {
      parsedCart.push(itemToAdd);
    }

    localStorage.setItem(cartKey, JSON.stringify(parsedCart));
    setCartFeedback((prev) => ({ ...prev, [product.id]: 'Added to cart' }));

    window.setTimeout(() => {
      setCartFeedback((prev) => ({ ...prev, [product.id]: '' }));
    }, 1600);
  };

  return (
    <motion.section
      id="products"
      className="section-block"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: sectionDuration, delay: sectionDelay }}
    >
      <div className="container-12">
        <div className="section-header-premium">
          <h2>Featured Products</h2>
        </div>

        {loading ? <p className="section-status">Loading products...</p> : null}
        {!loading && error ? <p className="section-status section-status-error">{error}</p> : null}

        <div className="products-grid-premium">
          {featuredProducts.map((item, index) => {
            const badge = getProductBadge(item);
            const rating = getRating(item);

            return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ duration: 0.24, delay: sectionDelay + index * cardStagger }}
              className="glass-card product-card-premium"
            >
              <div className="product-image-wrap">
                {badge ? <span className={`badge ${badge === 'HOT' ? 'badge-hot' : 'badge-new'}`}>{badge}</span> : null}
                <img src="/images/shop-bg.jpg" alt={item.name || 'Product'} />
                <div className="quick-icons">
                  <button
                    type="button"
                    aria-label="Wishlist"
                    onClick={() => toggleWishlist(item.id)}
                  >
                    {wishlisted[item.id] ? 'Liked' : 'Like'}
                  </button>
                  <button type="button" aria-label="Preview" onClick={() => navigate('/shop')}>View</button>
                </div>
              </div>

              <div className="product-meta">
                <h3>{item.name || 'Untitled product'}</h3>
                <p className="price-text">{formatPrice(item.price)}</p>
                <p className="rating">{'*'.repeat(rating)}{'.'.repeat(5 - rating)}</p>
                <p className="product-description">{item.description || 'Premium gaming accessory.'}</p>
                <button type="button" className="btn-gold w-full" onClick={() => addToCart(item)}>Add to Cart</button>
                {cartFeedback[item.id] ? <p className="section-status">{cartFeedback[item.id]}</p> : null}
              </div>
            </motion.article>
            );
          })}

          {!loading && !error && featuredProducts.length === 0 ? (
            <p className="section-status">No products available yet.</p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

export default Products;
