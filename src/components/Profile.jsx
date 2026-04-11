import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-shell py-4">
        <div className="content-container">
          <h2>Profile</h2>
          <p>You are browsing as a guest. Log in to see your profile details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-4">
      <div className="content-container">
        <h2>Profile</h2>
        <div className="card">
          <div className="card-body">
            <h3>{user.username}</h3>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 