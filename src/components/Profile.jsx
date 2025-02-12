import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      <div className="card">
        <div className="card-body">
          <h3>{user.username}</h3>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile; 