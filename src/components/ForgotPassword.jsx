import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setStatus(response?.message || 'If an account exists for that email, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to request a password reset right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-card glass-card">
        <div className="auth-header">
          <p className="auth-kicker">Password Help</p>
          <h2>Forgot Password</h2>
          <p>Enter the email on your account and we will send you a reset link.</p>
        </div>

        {status ? <div className="auth-success">{status}</div> : null}
        {error ? <div className="auth-alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div>
            <label htmlFor="forgot-email" className="auth-label">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="form-control auth-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-button-row">
            <button type="submit" className="btn-gold auth-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="btn-outline-gold auth-btn-secondary">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;