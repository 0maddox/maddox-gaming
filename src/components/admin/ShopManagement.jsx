import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../../config/env';

const parseVariantLines = (text) => {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [color = '', model = '', compatibility = ''] = line.split('|').map((part) => part.trim());
      return {
        color,
        model,
        compatibility,
      };
    });
};

const toVariantLines = (variants, fallbackProduct) => {
  if (Array.isArray(variants) && variants.length > 0) {
    return variants
      .map((variant) => [variant?.color || '', variant?.model || '', variant?.compatibility || ''].join('|'))
      .join('\n');
  }

  const fallback = [fallbackProduct?.color || '', fallbackProduct?.variant_model || '', fallbackProduct?.compatibility || '']
    .join('|')
    .trim();

  return fallback && fallback !== '||' ? fallback : '';
};

function ShopManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formById, setFormById] = useState({});
  const [statusById, setStatusById] = useState({});

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to load products.');
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      setProducts(list);
      setFormById(
        list.reduce((acc, item) => {
          acc[item.id] = {
            low_stock_threshold: item.low_stock_threshold ?? 5,
            variantsText: toVariantLines(item.variants, item),
          };
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFieldChange = (productId, field, value) => {
    setFormById((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value,
      },
    }));
  };

  const saveProduct = async (productId) => {
    const form = formById[productId] || {};

    setStatusById((prev) => ({ ...prev, [productId]: { type: 'loading', message: 'Saving...' } }));

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            low_stock_threshold: Number(form.low_stock_threshold || 0),
            variants: parseVariantLines(form.variantsText),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save product settings.');
      }

      const updated = await response.json();
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setStatusById((prev) => ({ ...prev, [productId]: { type: 'success', message: 'Saved' } }));
    } catch (err) {
      setStatusById((prev) => ({
        ...prev,
        [productId]: { type: 'error', message: err.message || 'Save failed' },
      }));
    }
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p className="admin-shop-error">{error}</p>;
  }

  return (
    <section className="admin-shop-panel">
      <div className="admin-shop-header">
        <h3>Shop Management</h3>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fetchProducts}>
          Refresh
        </button>
      </div>

      <p className="admin-shop-help">
        Edit low-stock threshold and variants directly. Variant format: color|model|compatibility (one per line).
      </p>

      <div className="table-responsive">
        <table className="table table-sm align-middle admin-shop-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Low-stock threshold</th>
              <th>Variants</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => {
              const form = formById[item.id] || {};
              const status = statusById[item.id];

              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name || 'Untitled'}</strong>
                    <div className="text-muted small">ID: {item.id}</div>
                  </td>
                  <td>
                    <span>{item.stock ?? 0}</span>
                    <div className="text-muted small">{item.stock_status || 'in_stock'}</div>
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      min="0"
                      value={form.low_stock_threshold ?? 5}
                      onChange={(event) => handleFieldChange(item.id, 'low_stock_threshold', event.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="form-control form-control-sm admin-variants-textarea"
                      value={form.variantsText || ''}
                      rows={4}
                      onChange={(event) => handleFieldChange(item.id, 'variantsText', event.target.value)}
                      placeholder="Black|Pro|PS5\nWhite|Lite|Xbox"
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => saveProduct(item.id)}>
                      Save
                    </button>
                    {status ? (
                      <div className={`admin-save-status admin-save-status-${status.type}`}>{status.message}</div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ShopManagement;
