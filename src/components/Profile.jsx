import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadFileDirect } from '../services/directUpload';
import { fetchMyProfile, updateMyProfile } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const { user, logout, syncUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchMyProfile(user.id).then(setProfile).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

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

  const currentAvatar = previewUrl || profile?.avatar_url || user.profilePictureUrl || '';

  const handleAvatarUpload = async () => {
    if (!user?.id || !selectedFile) {
      return;
    }

    setUploading(true);
    setStatus('');
    setError('');

    try {
      const upload = await uploadFileDirect(selectedFile);
      const updatedProfile = await updateMyProfile(user.id, {
        profile_picture_signed_id: upload.signedId,
      });

      setProfile(updatedProfile);
      syncUser({ ...user, ...updatedProfile, email: updatedProfile.email || user.email });
      setSelectedFile(null);
      setStatus('Profile picture updated.');
    } catch (err) {
      setError(err?.message || 'Unable to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-shell py-4">
      <div className="content-container">
        <h2>Profile</h2>
        <div className="card">
          <div className="card-body">
            {currentAvatar ? <img src={currentAvatar} alt="Profile" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} /> : null}
            <h3>{user.username}</h3>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <div style={{ display: 'grid', gap: 10, maxWidth: 360, marginBottom: 16 }}>
              <label htmlFor="profile-picture-upload" className="auth-label">Profile Picture</label>
              <input
                id="profile-picture-upload"
                type="file"
                className="form-control auth-control"
                accept="image/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              />
              <button
                type="button"
                className="btn-gold"
                onClick={handleAvatarUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload New Picture'}
              </button>
              {status ? <p className="section-status">{status}</p> : null}
              {error ? <p className="section-status section-status-error">{error}</p> : null}
            </div>
            <div className="profile-actions">
              <button type="button" className="btn-outline-gold" onClick={handleLogout}>Logout</button>
            </div>
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