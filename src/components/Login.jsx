import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    
    if (result.success) {
      navigate('/shop');
    } else {
      setError(result.error || 'Invalid email or password');
    }

    setIsSubmitting(false);
  };

  return (
    <section className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-card glass-card">
        <div className="auth-header">
          <p className="auth-kicker">Welcome Back</p>
          <h2>Login</h2>
          <p>Access your profile, cart, and tournament registrations.</p>
        </div>

        {error ? <div className="auth-alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              type="email"
              className="form-control auth-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              type="password"
              className="form-control auth-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <div className="auth-helper-row">
              <Link to="/forgot-password" className="auth-inline-link">Forgot password?</Link>
            </div>
          </div>

          <div className="auth-button-row">
            <button type="submit" className="btn-gold auth-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Login'}
            </button>
            <Link to="/signup" className="btn-outline-gold auth-btn-secondary">
              Create Account
            </Link>
          </div>

          <p className="auth-footer-note">
            New here? <Link to="/signup">Sign up and join the community</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login; 