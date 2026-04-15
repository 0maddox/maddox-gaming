import React, { useEffect, useMemo, useState } from 'react';
import { fetchFinanceSummary } from '../../services/api';

const currency = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function FinanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const response = await fetchFinanceSummary();
        if (!cancelled) {
          setSummary(response);
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.response?.data?.error || 'Unable to load finance analytics.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxDailyRevenue = useMemo(() => {
    const values = summary?.daily_revenue?.map((day) => Number(day.revenue || 0)) || [];
    return Math.max(...values, 1);
  }, [summary]);

  if (loading) {
    return <div className="admin-loading">Loading finance analytics...</div>;
  }

  if (error) {
    return <div className="admin-error">Error: {error}</div>;
  }

  return (
    <div className="admin-finance-shell">
      <div className="admin-header-row">
        <div>
          <h3>Revenue Analytics</h3>
          <p className="section-status">Daily revenue, payment mix, and recent confirmed payments.</p>
        </div>
      </div>

      <section className="admin-finance-grid">
        <article className="glass-card admin-finance-card">
          <h4>Total Revenue</h4>
          <p>{currency.format(Number(summary?.total_revenue || 0))}</p>
        </article>
        <article className="glass-card admin-finance-card">
          <h4>Paid Orders</h4>
          <p>{summary?.paid_orders_count || 0}</p>
        </article>
        <article className="glass-card admin-finance-card">
          <h4>Average Order</h4>
          <p>{currency.format(Number(summary?.average_order_value || 0))}</p>
        </article>
        <article className="glass-card admin-finance-card">
          <h4>Open Risk</h4>
          <p>{(summary?.pending_orders_count || 0) + (summary?.failed_orders_count || 0)} pending or failed</p>
        </article>
      </section>

      <section className="admin-finance-split">
        <article className="glass-card admin-chart-card">
          <h3>Last 14 Days</h3>
          <div className="admin-revenue-bars" role="img" aria-label="Daily revenue for the last 14 days">
            {(summary?.daily_revenue || []).map((day) => {
              const revenue = Number(day.revenue || 0);
              const height = `${Math.max((revenue / maxDailyRevenue) * 100, revenue > 0 ? 8 : 2)}%`;

              return (
                <div className="admin-revenue-day" key={day.date}>
                  <span className="admin-revenue-value">{currency.format(revenue)}</span>
                  <div className="admin-revenue-bar-wrap">
                    <div className="admin-revenue-bar" style={{ height }} />
                  </div>
                  <span className="admin-revenue-label">{new Date(day.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="glass-card admin-chart-card">
          <h3>Payment Mix</h3>
          <div className="admin-breakdown-list">
            {(summary?.payment_method_breakdown || []).map((item) => (
              <div className="admin-breakdown-item" key={item.method}>
                <div>
                  <strong>{item.method}</strong>
                  <small>Method revenue</small>
                </div>
                <p>{currency.format(Number(item.revenue || 0))}</p>
              </div>
            ))}
            {(summary?.gateway_breakdown || []).map((item) => (
              <div className="admin-breakdown-item" key={item.gateway}>
                <div>
                  <strong>{item.gateway}</strong>
                  <small>Gateway revenue</small>
                </div>
                <p>{currency.format(Number(item.revenue || 0))}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="glass-card admin-chart-card">
        <h3>Recent Confirmed Payments</h3>
        <div className="admin-recent-payments">
          {(summary?.recent_payments || []).map((payment) => (
            <div className="admin-recent-payment" key={payment.id}>
              <div>
                <strong>Order #{payment.id}</strong>
                <p>{payment.username || payment.user_email}</p>
              </div>
              <div>
                <strong>{currency.format(Number(payment.amount || 0))}</strong>
                <p>{payment.payment_method} via {payment.gateway_name}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default FinanceDashboard;
