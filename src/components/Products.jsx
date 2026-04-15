import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createProductReview, fetchProductReviews, fetchProducts } from '../services/api';
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
  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviewsByProduct, setReviewsByProduct] = useState({});

  const { user } = useAuth();
  const { addToCart } = useCart();

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
    if (product.stock_status === 'low_stock') {
      return 'HOT';
    }

    const createdAt = product.created_at ? new Date(product.created_at).getTime() : 0;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (createdAt && Date.now() - createdAt < sevenDays) {
      return 'NEW';
    }

    return null;
  };

  const variantOptions = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }

    return [
      {
        color: product.color || 'Standard',
        model: product.variant_model || 'Base',
        compatibility: product.compatibility || 'Universal',
      },
    ];
  };

  const getSelectedVariant = (product) => {
    const options = variantOptions(product);
    return selectedVariants[product.id] || options[0] || {};
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

  const pushToCart = (product) => {
    const variant = getSelectedVariant(product);
    addToCart(product, variant);
    setCartFeedback((prev) => ({ ...prev, [product.id]: 'Added to cart' }));

    window.setTimeout(() => {
      setCartFeedback((prev) => ({ ...prev, [product.id]: '' }));
    }, 1600);
  };

  const loadReviews = async (productId) => {
    setReviewsByProduct((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), loading: true, error: '' },
    }));

    try {
      const payload = await fetchProductReviews(productId);
      setReviewsByProduct((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          loading: false,
          open: true,
          list: payload.reviews || [],
          averageRating: payload.average_rating || 0,
          ratingsCount: payload.ratings_count || 0,
          form: prev[productId]?.form || { rating: 5, comment: '' },
        },
      }));
    } catch (err) {
      setReviewsByProduct((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          loading: false,
          error: 'Unable to load reviews right now.',
        },
      }));
    }
  };

  const toggleReviews = (productId) => {
    const state = reviewsByProduct[productId];

    if (!state?.open && (!state?.list || state.list.length === 0)) {
      loadReviews(productId);
      return;
    }

    setReviewsByProduct((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        open: !prev[productId]?.open,
      },
    }));
  };

  const updateReviewForm = (productId, patch) => {
    setReviewsByProduct((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        form: {
          rating: prev[productId]?.form?.rating || 5,
          comment: prev[productId]?.form?.comment || '',
          ...patch,
        },
      },
    }));
  };

  const submitReview = async (event, productId) => {
    event.preventDefault();

    const form = reviewsByProduct[productId]?.form || { rating: 5, comment: '' };

    try {
      await createProductReview(productId, {
        rating: Number(form.rating || 5),
        comment: form.comment || '',
      });
      await loadReviews(productId);
      updateReviewForm(productId, { comment: '', rating: 5 });
    } catch (err) {
      setReviewsByProduct((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          error: err?.response?.data?.error || 'Unable to save review.',
        },
      }));
    }
  };

  const stockText = (product) => {
    if (product.stock_status === 'out_of_stock') return 'Out of stock';
    if (product.stock_status === 'low_stock') return 'Low stock';
    return 'In stock';
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

        {loading ? (
          <div className="products-grid-premium" aria-label="Loading products">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="glass-card skeleton-card" />
            ))}
          </div>
        ) : null}
        {!loading && error ? <p className="section-status section-status-error">{error}</p> : null}

        <div className="products-grid-premium">
          {featuredProducts.map((item, index) => {
            const badge = getProductBadge(item);
            const options = variantOptions(item);
            const selected = getSelectedVariant(item);
            const reviewState = reviewsByProduct[item.id] || {};
            const averageRating = reviewState.averageRating || item.average_rating || 0;
            const ratingsCount = reviewState.ratingsCount || item.ratings_count || 0;

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
                <p className="rating">Rating: {averageRating.toFixed(1)} / 5 ({ratingsCount})</p>
                <p className="product-description">{item.description || 'Premium gaming accessory.'}</p>

                <div className="product-variant-selectors">
                  <label htmlFor={`variant-${item.id}`}>Variant</label>
                  <select
                    id={`variant-${item.id}`}
                    value={JSON.stringify(selected)}
                    onChange={(event) => setSelectedVariants((prev) => ({
                      ...prev,
                      [item.id]: JSON.parse(event.target.value),
                    }))}
                  >
                    {options.map((option, optionIndex) => (
                      <option key={`${item.id}-${optionIndex}`} value={JSON.stringify(option)}>
                        {[option.color, option.model, option.compatibility].filter(Boolean).join(' / ')}
                      </option>
                    ))}
                  </select>
                </div>

                <p className={`stock-chip stock-${item.stock_status || 'in_stock'}`}>{stockText(item)}</p>

                <div className="product-actions-row">
                  <button
                    type="button"
                    className="btn-gold w-full"
                    disabled={item.stock_status === 'out_of_stock'}
                    onClick={() => pushToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button type="button" className="btn-outline-gold w-full" onClick={() => navigate('/checkout')}>
                    Checkout
                  </button>
                </div>
                {cartFeedback[item.id] ? <p className="section-status">{cartFeedback[item.id]}</p> : null}

                <button
                  type="button"
                  className="btn-outline-gold w-full mt-2"
                  onClick={() => toggleReviews(item.id)}
                >
                  {reviewState?.open ? 'Hide Reviews' : 'Reviews & Ratings'}
                </button>

                {reviewState?.open ? (
                  <div className="reviews-panel">
                    {reviewState.loading ? <p className="section-status">Loading reviews...</p> : null}
                    {reviewState.error ? <p className="section-status section-status-error">{reviewState.error}</p> : null}

                    {Array.isArray(reviewState.list) && reviewState.list.length > 0 ? (
                      <div className="reviews-list">
                        {reviewState.list.slice(0, 3).map((review) => (
                          <article key={review.id} className="review-item">
                            <p className="review-meta">
                              {review.user?.username || 'Player'} | {review.rating}/5
                            </p>
                            <p>{review.comment || 'No comment provided.'}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="section-status">No reviews yet.</p>
                    )}

                    {user ? (
                      <form className="review-form" onSubmit={(event) => submitReview(event, item.id)}>
                        <label htmlFor={`rating-${item.id}`}>Your rating</label>
                        <select
                          id={`rating-${item.id}`}
                          value={reviewState?.form?.rating || 5}
                          onChange={(event) => updateReviewForm(item.id, { rating: Number(event.target.value) })}
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>{value}/5</option>
                          ))}
                        </select>

                        <textarea
                          value={reviewState?.form?.comment || ''}
                          onChange={(event) => updateReviewForm(item.id, { comment: event.target.value })}
                          placeholder="Tell others how this product performs"
                          rows={3}
                        />
                        <button type="submit" className="btn-gold w-full">Submit Review</button>
                      </form>
                    ) : (
                      <p className="section-status">Sign in to leave a review.</p>
                    )}
                  </div>
                ) : null}
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
