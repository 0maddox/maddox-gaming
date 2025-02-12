import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="admin-unauthorized">Unauthorized Access</div>;
  }

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="list-group">
            <Link to="/admin/users" className="list-group-item list-group-item-action">
              <i className="fas fa-users me-2"></i>Users
            </Link>
            <Link to="/admin/tournaments" className="list-group-item list-group-item-action">
              <i className="fas fa-trophy me-2"></i>Tournaments
            </Link>
            <Link to="/admin/posts" className="list-group-item list-group-item-action">
              <i className="fas fa-newspaper me-2"></i>Posts
            </Link>
            <Link to="/admin/events" className="list-group-item list-group-item-action">
              <i className="fas fa-calendar-alt me-2"></i>Events
            </Link>
            <Link to="/admin/shop" className="list-group-item list-group-item-action">
              <i className="fas fa-store me-2"></i>Shop Management
            </Link>
          </div>
        </div>
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <Routes>
                <Route path="/" element={
                  <div>
                    <h3>Welcome to Admin Dashboard</h3>
                    <p>Select an option from the menu to manage your site.</p>
                    <div className="row mt-4">
                      <div className="col-md-4 mb-3">
                        <div className="card text-center p-3">
                          <h4>Total Users</h4>
                          <p className="h2">{users.length}</p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="card text-center p-3">
                          <h4>Active Tournaments</h4>
                          <p className="h2">0</p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="card text-center p-3">
                          <h4>Total Posts</h4>
                          <p className="h2">0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/users" element={<h3>User Management</h3>} />
                <Route path="/tournaments" element={<h3>Tournament Management</h3>} />
                <Route path="/posts" element={<h3>Post Management</h3>} />
                <Route path="/events" element={<h3>Event Management</h3>} />
                <Route path="/shop" element={<h3>Shop Management</h3>} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 