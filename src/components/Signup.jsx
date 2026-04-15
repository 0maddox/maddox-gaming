import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config/env';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword') {
        formDataToSend.append(`user[${key}]`, formData[key]);
      }
    });
    if (profilePicture) {
      formDataToSend.append('user[profile_picture]', profilePicture);
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json().catch(() => ({}));
        const apiError =
          data?.error ||
          data?.message ||
          (typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Signup failed');
        setError(apiError || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell auth-shell-signup">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-card glass-card auth-card-wide">
        <div className="auth-header">
          <p className="auth-kicker">Create Profile</p>
          <h2>Create Gaming Account</h2>
          <p>Join tournaments, save favorites, and unlock member-only offers.</p>
        </div>

        {error ? <div className="auth-alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form-grid auth-form-grid-wide">
          <div>
            <label htmlFor="username" className="auth-label">Gaming Username</label>
            <input
              type="text"
              className="form-control auth-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              placeholder="Your in-game tag"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              type="email"
              className="form-control auth-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="phone_number" className="auth-label">Phone Number</label>
            <input
              type="tel"
              className="form-control auth-control"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="07XXXXXXXX or +2547XXXXXXXX"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              type="password"
              className="form-control auth-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
            <input
              type="password"
              className="form-control auth-control"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Repeat password"
              required
            />
          </div>

          <div>
            <label htmlFor="profilePicture" className="auth-label">Profile Picture</label>
            <input
              type="file"
              className="form-control auth-control"
              id="profilePicture"
              name="profilePicture"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <div className="auth-button-row auth-button-row-wide">
            <button type="submit" className="btn-gold auth-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
            <Link to="/login" className="btn-outline-gold auth-btn-secondary">
              Back to Login
            </Link>
          </div>

          <p className="auth-footer-note">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Signup;