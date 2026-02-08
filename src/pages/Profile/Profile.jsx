import React, { useState, useEffect } from 'react';
import './Profile.css';
import { auth } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    setUser(currentUser);
    setDisplayName(currentUser.displayName || '');
  }, [navigate]);

  const handleUpdateName = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      setEditing(false);
      alert('✅ Profile updated successfully!');
      window.location.reload(); // Refresh to update navbar
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Failed to update profile');
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>👤 Profile</h1>
        
        <div className="profile-card">
          <div className="profile-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {(user.displayName || user.email)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="info-row">
              <label>Display Name</label>
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              ) : (
                <span>{user.displayName || 'Not set'}</span>
              )}
            </div>

            <div className="info-row">
              <label>Email</label>
              <span>{user.email}</span>
            </div>

            <div className="info-row">
              <label>Account Created</label>
              <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
            </div>

            <div className="info-row">
              <label>Last Sign In</label>
              <span>{new Date(user.metadata.lastSignInTime).toLocaleDateString()}</span>
            </div>

            <div className="info-row">
              <label>Provider</label>
              <span>{user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}</span>
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="save-btn" onClick={handleUpdateName}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
