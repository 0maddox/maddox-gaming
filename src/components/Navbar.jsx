import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout, hasPermission } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const canAccessAdmin = hasPermission('access_admin');
  const canManageTournaments = hasPermission('manage_tournaments');
  const canManageProducts = hasPermission('manage_products');
  const canManageContent = hasPermission('manage_content');
  const canManageUsers = hasPermission('manage_users');
  const canViewAnalytics = hasPermission('view_analytics');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="premium-nav-wrap">
      <nav className="container-12 premium-nav">
        <Link to="/" className="brand-mark">Maddox Gaming</Link>

        <ul className="nav-center-links">
          <li><Link to="/#products">Products</Link></li>
          <li><Link to="/#tournaments">Tournaments</Link></li>
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#gallery">Gallery</Link></li>
          <li><Link to="/community">Community</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/checkout">Cart ({totalItems})</Link></li>
          {user ? <li><Link to="/chat">Chat</Link></li> : null}
          {canManageTournaments ? <li><Link to="/admin/tournaments">Manage Tournaments</Link></li> : null}
          {canManageProducts ? <li><Link to="/admin/shop">Manage Shop</Link></li> : null}
          {canManageContent ? <li><Link to="/admin/posts">Manage Content</Link></li> : null}
          {canManageUsers ? <li><Link to="/admin/users">Manage Users</Link></li> : null}
          {canViewAnalytics ? <li><Link to="/admin/analytics">Analytics</Link></li> : null}
        </ul>

        <div className="nav-right-actions">
          {user ? (
            <>
              {canAccessAdmin ? <Link to="/admin" className="btn-outline-gold">Dashboard</Link> : null}
              <Link to="/profile" className="btn-outline-gold">Profile</Link>
              <button type="button" className="btn-gold" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline-gold">Login</Link>
              <Link to="/signup" className="btn-gold">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;