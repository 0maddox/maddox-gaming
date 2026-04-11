import React, { useEffect, useState } from 'react';
import { fetchShopFeed } from '../services/api';

const SHOP_CATEGORIES = [
  'for-you',
  'gamepads',
  'headphones',
  'earphones',
  'joysticks',
  'consoles',
  'gaming phones',
  'gaming sleeves',
  'triggers',
  'gloves',
  'phone and ipad coolers',
];

function Shop() {
  const [items, setItems] = useState([]);
  const [sourceStatus, setSourceStatus] = useState({});
  const [sourceLinks, setSourceLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadShopData = async () => {
      try {
        const data = await fetchShopFeed();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setSourceStatus(data?.source_status || {});
        setSourceLinks(data?.source_links || {});
      } catch (err) {
        setError('Unable to load shop feed right now.');
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, []);

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) {
      return 'Price unavailable';
    }

    return `${currency || 'USD'} ${Number(price).toFixed(2)}`;
  };

  const discountedPrice = (price, discountPercent) => {
    if (price === null || price === undefined || !discountPercent) return null;
    const discounted = Number(price) * (1 - Number(discountPercent) / 100);
    return discounted.toFixed(2);
  };

  const toLabel = (value) =>
    value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const placeholderImage = (item) => {
    const seed = String(item?.title || item?.id || 'item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `https://picsum.photos/seed/${seed}/960/540`;
  };

  const itemsByCategory = SHOP_CATEGORIES.reduce((acc, category) => {
    if (category === 'for-you') {
      acc[category] = items;
      return acc;
    }

    acc[category] = items.filter((item) => (item?.category || 'for-you') === category);
    return acc;
  }, {});

  const featuredItems = items.slice(0, 6);

  return (
    <div className="page-shell py-4 shop-catalog-page">
      <div className="shop-catalog-shell">
        <section className="shop-hero-strip">
          <div>
            <p className="shop-hero-kicker">Maddox Shop</p>
            <h2>Shop By Category</h2>
            <p className="shop-hero-subtitle">
              Browse accessory collections by category, open offers instantly, and keep your setup battle-ready.
            </p>
          </div>
          <div className="shop-source-chips" aria-label="Shop source status">
            <span className="shop-source-chip">TikTok: {sourceStatus?.tiktok || 'unknown'}</span>
            <span className="shop-source-chip">WhatsApp: {sourceStatus?.whatsapp || 'unknown'}</span>
            {sourceLinks?.tiktok_profile ? (
              <a href={sourceLinks.tiktok_profile} target="_blank" rel="noreferrer" className="shop-source-link">
                TikTok Shop
              </a>
            ) : null}
            {sourceLinks?.whatsapp_catalog ? (
              <a href={sourceLinks.whatsapp_catalog} target="_blank" rel="noreferrer" className="shop-source-link whatsapp">
                WhatsApp Catalog
              </a>
            ) : null}
          </div>
        </section>

        {loading && <p>Loading shop items...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {featuredItems.length > 0 ? (
              <section className="shop-featured-row">
                <h3>Trending Now</h3>
                <div className="shop-row-track" role="list" aria-label="Trending products">
                  {featuredItems.map((item, idx) => {
                    const salePrice = discountedPrice(item.price, item.discount_percent);
                    return (
                      <article key={`featured-${item.source}-${item.id || idx}`} className="shop-item-tile featured" role="listitem">
                        <img
                          className="shop-item-image"
                          src={item?.image_url || placeholderImage(item)}
                          alt={item?.title || 'Product image'}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = placeholderImage(item);
                          }}
                        />
                        <div className="shop-item-overlay" />
                        <div className="shop-item-content">
                          <span className="shop-item-badge">{toLabel(item?.category || 'for-you')}</span>
                          <h4>{item.title}</h4>
                          <p>{item.description || 'No description available.'}</p>
                          <div className="shop-item-meta">
                            <span>{item.source}</span>
                            <span>{salePrice ? `${item.currency || 'USD'} ${salePrice}` : formatPrice(item.price, item.currency)}</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {items.length === 0 ? (
              <p>No items found yet. Configure TikTok/WhatsApp feed URLs in backend env vars.</p>
            ) : (
              <div className="shop-rails" role="list" aria-label="Product categories">
                {SHOP_CATEGORIES.map((category) => {
                  const rowItems = itemsByCategory[category] || [];

                  if (rowItems.length === 0) return null;

                  return (
                    <section key={category} className="shop-category-row" role="listitem" aria-label={`${toLabel(category)} row`}>
                      <h3>{toLabel(category)}</h3>
                      <div className="shop-row-track" role="list" aria-label={`${toLabel(category)} products`}>
                        {rowItems.map((item, idx) => {
                          const salePrice = discountedPrice(item.price, item.discount_percent);
                          const isWhatsApp = item.source === 'whatsapp';
                          const actionLabel = isWhatsApp ? 'Buy on WhatsApp' : 'View Offer';
                          const actionClass = isWhatsApp ? 'buy-button buy-button-whatsapp' : 'buy-button';
                          return (
                            <article key={`${category}-${item.source}-${item.id || idx}`} className="shop-item-tile" role="listitem">
                              <img
                                className="shop-item-image"
                                src={item?.image_url || placeholderImage(item)}
                                alt={item?.title || 'Product image'}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = placeholderImage(item);
                                }}
                              />
                              <div className="shop-item-content">
                                <small className="text-muted text-uppercase">{item.source}</small>
                                <h4>{item.title}</h4>
                                <p>{item.description || 'No description available.'}</p>

                                {salePrice ? (
                                  <div className="product-price">
                                    <span className="shop-price-strike">{formatPrice(item.price, item.currency)}</span>
                                    <span>{`${item.currency || 'USD'} ${salePrice}`}</span>
                                  </div>
                                ) : (
                                  <div className="product-price">{formatPrice(item.price, item.currency)}</div>
                                )}

                                {item.discount_percent ? (
                                  <p className="mb-2 text-success">{`${Number(item.discount_percent).toFixed(0)}% off`}</p>
                                ) : null}

                                {item.offer_label ? <p className="mb-2">Offer: {item.offer_label}</p> : null}

                                {item.external_url ? (
                                  <a className={actionClass} href={item.external_url} target="_blank" rel="noreferrer">
                                    {actionLabel}
                                  </a>
                                ) : (
                                  <span className="buy-button" style={{ opacity: 0.65, display: 'inline-block' }}>
                                    In App Listing
                                  </span>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Shop; 