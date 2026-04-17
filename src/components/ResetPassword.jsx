import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!token) {
      setError('This reset link is missing a token. Request a new password reset email.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(token, password, passwordConfirmation);
      setStatus(response?.message || 'Your password has been reset successfully.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to reset your password.');
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
          <h2>Reset Password</h2>
          <p>Choose a new password for your account.</p>
        </div>

        {status ? <div className="auth-success">{status}</div> : null}
        {error ? <div className="auth-alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div>
            <label htmlFor="reset-password" className="auth-label">New Password</label>
            <input
              id="reset-password"
              type="password"
              className="form-control auth-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Enter a new password"
              required
            />
          </div>

          <div>
            <label htmlFor="reset-password-confirmation" className="auth-label">Confirm New Password</label>
            <input
              id="reset-password-confirmation"
              type="password"
              className="form-control auth-control"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
              placeholder="Repeat the new password"
              required
            />
          </div>

          <div className="auth-button-row">
            <button type="submit" className="btn-gold auth-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;