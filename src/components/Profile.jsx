import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyProfile } from '../services/api';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchMyProfile(user.id).then(setProfile).catch(() => {});
  }, [user]);

  const xpData = useMemo(() => {
    const stats = profile?.stats || {};
    const xp = (stats.matches_won || 0) * 120 + (stats.tournaments_joined || 0) * 80 + (stats.followers || 0) * 20;
    const level = Math.max(1, Math.floor(xp / 500) + 1);
    const current = xp % 500;
    const progress = Math.min(100, Math.round((current / 500) * 100));

    const badges = [];
    if ((stats.matches_won || 0) >= 5) badges.push('Tournament Winner');
    if ((stats.codm_kills || 0) >= 100) badges.push('Top Player');
    if ((stats.followers || 0) >= 10) badges.push('Community Starter');

    return { xp, level, progress, badges };
  }, [profile]);

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
            {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} /> : null}
            <h3>{user.username}</h3>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>XP: {xpData.xp} | Level {xpData.level}</p>
            <div className="xp-progress-wrap">
              <div className="xp-progress-bar" style={{ width: `${xpData.progress}%` }} />
            </div>
            <p>{xpData.progress}% to next level</p>
            <p>Badges: {xpData.badges.length > 0 ? xpData.badges.join(', ') : 'No badges yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 