import React, { useEffect, useMemo, useState } from 'react';
import { closePaymentModal, useFlutterwave } from 'flutterwave-react-v3';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchOrders, retryOrderPayment } from '../services/api';

const currency = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function CheckoutPage() {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    totalItems,
    updateQuantity,
    removeFromCart,
    checkout,
    confirmPayment,
    itemSignature,
    syncError,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '2547');
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentSession, setPaymentSession] = useState(null);
  const [launchPaymentModal, setLaunchPaymentModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [retryingOrderId, setRetryingOrderId] = useState(null);

  const flutterwavePublicKey = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || '';

  const shippingFee = useMemo(() => (subtotal > 0 ? 250 : 0), [subtotal]);
  const grandTotal = subtotal + shippingFee;

  useEffect(() => {
    setPhoneNumber(user?.phoneNumber || '2547');
    setCustomerName(user?.username || '');
    setCustomerEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRecentOrders([]);
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      try {
        const response = await fetchOrders();
        if (!cancelled) {
          setRecentOrders(Array.isArray(response?.orders) ? response.orders : []);
        }
      } catch (error) {
        if (!cancelled) {
          setRecentOrders([]);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const flutterwaveConfig = useMemo(() => ({
    public_key: flutterwavePublicKey || 'missing-public-key',
    tx_ref: paymentSession?.payment_config?.tx_ref || 'pending-reference',
    amount: Number(paymentSession?.payment_config?.amount || grandTotal || 0),
    currency: paymentSession?.payment_config?.currency || 'KES',
    payment_options: paymentSession?.payment_config?.payment_options || (paymentMethod === 'card' ? 'card' : 'mobilemoneykenya'),
    customer: paymentSession?.payment_config?.customer || {
      email: customerEmail,
      phonenumber: phoneNumber,
      name: customerName || 'Customer',
    },
    customizations: paymentSession?.payment_config?.customizations || {
      title: 'Maddox Gaming',
      description: 'Payment for items',
    },
    meta: paymentSession?.payment_config?.meta || {},
  }), [customerEmail, customerName, flutterwavePublicKey, grandTotal, paymentMethod, paymentSession, phoneNumber]);

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const refreshOrders = async () => {
    const response = await fetchOrders();
    setRecentOrders(Array.isArray(response?.orders) ? response.orders : []);
  };

  useEffect(() => {
    if (!launchPaymentModal || !paymentSession?.payment_config) {
      return;
    }

    if (!flutterwavePublicKey) {
      setCheckoutError('Flutterwave public key is missing. Set REACT_APP_FLUTTERWAVE_PUBLIC_KEY before taking payments.');
      setSubmitting(false);
      setLaunchPaymentModal(false);
      return;
    }

    setLaunchPaymentModal(false);

    handleFlutterPayment({
      callback: async (response) => {
        try {
          const result = await confirmPayment(
            paymentSession.order.id,
            response?.tx_ref || paymentSession.payment_config.tx_ref
          );

          setCheckoutResult(result);
          await refreshOrders();
        } catch (error) {
          setCheckoutError(error?.response?.data?.error || 'Payment verification failed. Wait for the webhook or retry shortly.');
        } finally {
          closePaymentModal();
          setSubmitting(false);
          setPaymentSession(null);
        }
      },
      onClose: () => {
        setSubmitting(false);
        setPaymentSession(null);
        setCheckoutResult((current) => current || {
          order: paymentSession.order,
          message: 'Payment window closed. If you already approved the charge, order status will update after webhook confirmation.',
        });
      },
    });
  }, [confirmPayment, flutterwavePublicKey, handleFlutterPayment, launchPaymentModal, paymentSession]);

  const submitCheckout = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setCheckoutError('');
    setCheckoutResult(null);

    let openedFlutterwave = false;

    try {
      const result = await checkout({
        phoneNumber,
        paymentMethod,
        paymentProvider: paymentMethod === 'mpesa' ? 'daraja' : 'flutterwave',
        customerName,
        customerEmail,
      });

      setCheckoutResult(result);

      if (result?.provider === 'flutterwave' && result?.payment_config) {
        openedFlutterwave = true;
        setPaymentSession(result);
        setLaunchPaymentModal(true);
        return;
      }

      await refreshOrders();
    } catch (error) {
      setCheckoutError(error?.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      if (!openedFlutterwave) {
        setSubmitting(false);
      }
    }
  };

  const retryPayment = async (order) => {
    setRetryingOrderId(order.id);
    setCheckoutError('');

    try {
      const result = await retryOrderPayment(order.id, {
        phone_number: order.payment_phone || phoneNumber,
        customer_name: order.customer?.name || customerName,
        customer_email: order.customer?.email || customerEmail,
      });

      setCheckoutResult(result);

      if (result?.provider === 'flutterwave' && result?.payment_config) {
        setPaymentSession(result);
        setLaunchPaymentModal(true);
        return;
      }

      await refreshOrders();
    } catch (error) {
      setCheckoutError(error?.response?.data?.error || 'Unable to retry this payment right now.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  const payButtonLabel = paymentMethod === 'card'
    ? 'Pay with Card'
    : 'Pay with M-Pesa';

  return (
    <main className="container-12 section-block checkout-page">
      <section className="checkout-layout">
        <article className="glass-card checkout-cart-panel">
          <h2>Cart Summary</h2>
          <p className="section-status">{totalItems} item(s) in your cart</p>
          {syncError ? <p className="section-status section-status-error">{syncError}</p> : null}

          {items.length === 0 ? (
            <div className="checkout-empty-state">
              <p>Your cart is empty.</p>
              <Link to="/" className="btn-gold">Continue Shopping</Link>
            </div>
          ) : (
            <div className="checkout-cart-list" role="list" aria-label="Cart items">
              {items.map((item) => {
                const signature = itemSignature(item);
                const lineTotal = item.price * item.quantity;

                return (
                  <div className="checkout-item" key={signature} role="listitem">
                    <div>
                      <h3>{item.name}</h3>
                      <p className="checkout-variant-text">
                        {[item.variant?.color, item.variant?.model, item.variant?.compatibility]
                          .filter(Boolean)
                          .join(' / ') || 'Default variant'}
                      </p>
                    </div>

                    <div className="checkout-item-controls">
                      <button type="button" onClick={() => updateQuantity(signature, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(signature, item.quantity + 1)}>+</button>
                    </div>

                    <p>{currency.format(lineTotal)}</p>
                    <button type="button" className="checkout-remove" onClick={() => removeFromCart(signature)}>
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="glass-card checkout-payment-panel">
          <h2>Checkout</h2>
          <p className="section-status">Card payments use Flutterwave. M-Pesa now goes straight through Daraja STK Push with backend callback confirmation.</p>

          <div className="checkout-totals">
            <div><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
            <div><span>Shipping</span><span>{currency.format(shippingFee)}</span></div>
            <div className="checkout-grand-total"><span>Total</span><span>{currency.format(grandTotal)}</span></div>
          </div>

          <form className="checkout-form" onSubmit={submitCheckout}>
            <div className="checkout-method-grid" role="radiogroup" aria-label="Payment method">
              <button
                type="button"
                className={`checkout-method-card ${paymentMethod === 'mpesa' ? 'is-active' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <span>M-Pesa</span>
                <small>Direct Daraja STK Push</small>
              </button>
              <button
                type="button"
                className={`checkout-method-card ${paymentMethod === 'card' ? 'is-active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span>Card</span>
                <small>Secure Flutterwave modal</small>
              </button>
            </div>

            <label htmlFor="customerName">Customer name</label>
            <input
              id="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer Name"
              required
            />

            <label htmlFor="customerEmail">Email address</label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="user@email.com"
              required
            />

            <label htmlFor="phoneNumber">{paymentMethod === 'mpesa' ? 'M-Pesa phone number' : 'Phone number'}</label>
            <input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="2547XXXXXXXX"
              required={paymentMethod === 'mpesa'}
            />

            {paymentMethod === 'mpesa' ? (
              <p className="checkout-helper-text">After you continue, check your phone and enter your M-Pesa PIN to confirm the charge.</p>
            ) : (
              <p className="checkout-helper-text">Card payments are verified on the backend before the order is marked paid.</p>
            )}

            <button type="submit" className="btn-gold w-full" disabled={submitting || items.length === 0 || !user}>
              {submitting ? 'Preparing payment...' : payButtonLabel}
            </button>
          </form>

          {!user ? <p className="section-status section-status-error">Sign in before attempting checkout.</p> : null}

          {checkoutError ? <p className="section-status section-status-error">{checkoutError}</p> : null}

          {checkoutResult?.order ? (
            <div className="checkout-result success">
              <h3>Payment initiated</h3>
              <p>Status: {checkoutResult.order.status}</p>
              <p>Method: {checkoutResult.order.payment_method}</p>
              <p>Reference: {checkoutResult.order.payment_reference}</p>
              <p>{checkoutResult.message}</p>
            </div>
          ) : null}

          <div className="checkout-history">
            <div className="checkout-history-header">
              <h3>Recent Orders</h3>
              <span>{recentOrders.length} tracked</span>
            </div>

            {recentOrders.length === 0 ? (
              <p className="checkout-helper-text">No orders yet.</p>
            ) : (
              <div className="checkout-history-list" role="list" aria-label="Recent orders">
                {recentOrders.map((order) => (
                  <div className="checkout-history-item" key={order.id} role="listitem">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <p>{currency.format(Number(order.total_amount || 0))}</p>
                    </div>
                    <div>
                      <span className={`checkout-status-pill checkout-status-${order.status}`}>{order.status}</span>
                      <p>{order.payment_method} via {order.gateway_name}</p>
                      {order.notifications ? <p>Notifications sent</p> : null}
                    </div>
                    {order.retryable ? (
                      <button
                        type="button"
                        className="checkout-retry-button"
                        onClick={() => retryPayment(order)}
                        disabled={retryingOrderId === order.id}
                      >
                        {retryingOrderId === order.id ? 'Retrying...' : 'Retry Payment'}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default CheckoutPage;
