import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const runtimeApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api/v1`
    : 'http://localhost:3000/api/v1';

const API_URL = process.env.REACT_APP_API_URL || runtimeApiUrl;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [roleUpdates, setRoleUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser, hasPermission } = useAuth();

  const roleOptions = [
    'user',
    'support_agent',
    'community_moderator',
    'tournament_manager',
    'catalog_manager',
    'content_admin',
    'marketing_manager',
    'analytics_viewer',
    'finance_admin',
    'super_admin',
  ];

  const menuSections = [
    { path: 'users', label: 'Users', icon: 'fas fa-users', permission: 'manage_users' },
    { path: 'tournaments', label: 'Tournaments', icon: 'fas fa-trophy', permission: 'manage_tournaments' },
    { path: 'posts', label: 'Posts', icon: 'fas fa-newspaper', permission: 'manage_content' },
    { path: 'events', label: 'Events', icon: 'fas fa-calendar-alt', permission: 'manage_content' },
    { path: 'shop', label: 'Shop Management', icon: 'fas fa-store', permission: 'manage_products' },
    { path: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line', permission: 'view_analytics' },
    { path: 'finance', label: 'Finance', icon: 'fas fa-wallet', permission: 'manage_finance' },
  ];

  const visibleSections = menuSections.filter((item) => hasPermission(item.permission));

  const roleLabel = (role = 'user') =>
    role
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const roleBadgeClass = (role = 'user') => `role-badge role-${role.replace(/_/g, '-')}`;

  const canViewUsers = hasPermission('manage_users');
  const canAssignRoles = hasPermission('assign_roles');

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [canViewUsers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
      const initialRoles = data.reduce((acc, item) => ({ ...acc, [item.id]: item.role || 'user' }), {});
      setRoleUpdates(initialRoles);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const updateUserRole = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: { role: roleUpdates[userId] }
        })
      });

      if (!response.ok) throw new Error('Failed to update role');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentUser || !hasPermission('access_admin')) {
    return <div className="admin-unauthorized">Unauthorized Access</div>;
  }

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="admin-header-row">
        <h2>Admin Dashboard</h2>
        <span className={roleBadgeClass(currentUser.role)}>{roleLabel(currentUser.role)}</span>
      </div>
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="list-group">
            {visibleSections.map((section) => (
              <Link key={section.path} to={`/admin/${section.path}`} className="list-group-item list-group-item-action">
                <i className={`${section.icon} me-2`}></i>{section.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <Routes>
                <Route index element={
                  <div>
                    <h3>Welcome to Admin Dashboard</h3>
                    <p>Select an option from the menu to manage your site.</p>
                    <div className="row mt-4">
                      <div className="col-md-4 mb-3">
                        <div className="card text-center p-3">
                          <h4>Total Users</h4>
                          <p className="h2">{canViewUsers ? users.length : '-'}</p>
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
                <Route
                  path="users"
                  element={(
                    canViewUsers ? (
                      <div>
                        <h3>User Management</h3>
                        <table className="table mt-3">
                          <thead>
                            <tr>
                              <th>Email</th>
                              <th>Username</th>
                              <th>Role</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((item) => (
                              <tr key={item.id}>
                                <td>{item.email}</td>
                                <td>{item.username}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={roleBadgeClass(item.role || 'user')}>{roleLabel(item.role || 'user')}</span>
                                    <select
                                      className="form-select"
                                      disabled={!canAssignRoles}
                                      value={roleUpdates[item.id] || item.role || 'user'}
                                      onChange={(e) => setRoleUpdates((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                    >
                                      {roleOptions.map((roleName) => (
                                        <option key={roleName} value={roleName}>{roleLabel(roleName)}</option>
                                      ))}
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    disabled={!canAssignRoles}
                                    onClick={() => updateUserRole(item.id)}
                                  >
                                    Save Role
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <div className="admin-unauthorized">No access to user management.</div>
                  )}
                />
                <Route path="tournaments" element={hasPermission('manage_tournaments') ? <h3>Tournament Management</h3> : <div className="admin-unauthorized">No access to tournaments management.</div>} />
                <Route path="posts" element={hasPermission('manage_content') ? <h3>Post Management</h3> : <div className="admin-unauthorized">No access to post management.</div>} />
                <Route path="events" element={hasPermission('manage_content') ? <h3>Event Management</h3> : <div className="admin-unauthorized">No access to event management.</div>} />
                <Route path="shop" element={hasPermission('manage_products') ? <h3>Shop Management</h3> : <div className="admin-unauthorized">No access to shop management.</div>} />
                <Route path="analytics" element={hasPermission('view_analytics') ? <h3>Analytics Dashboard</h3> : <div className="admin-unauthorized">No access to analytics.</div>} />
                <Route path="finance" element={hasPermission('manage_finance') ? <h3>Finance Management</h3> : <div className="admin-unauthorized">No access to finance.</div>} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 