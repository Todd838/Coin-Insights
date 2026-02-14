import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import { auth } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AvatarCreator from '../../components/AvatarCreator/AvatarCreator';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const [profilePicOption, setProfilePicOption] = useState('google'); // google, upload, avatar, custom
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Preset avatar options
  const avatarOptions = [
    { id: 1, emoji: '🧑‍💼', name: 'Professional', color: '#4A90E2' },
    { id: 2, emoji: '👨‍💻', name: 'Developer', color: '#00ffff' },
    { id: 3, emoji: '🦸', name: 'Hero', color: '#ff00ff' },
    { id: 4, emoji: '🧙', name: 'Wizard', color: '#ffff00' },
    { id: 5, emoji: '🤖', name: 'Robot', color: '#0088ff' },
    { id: 6, emoji: '👽', name: 'Alien', color: '#00ff00' }
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    setUser(currentUser);
    setDisplayName(currentUser.displayName || '');
    
    // Check if user has uploaded image stored in localStorage
    const storedImage = localStorage.getItem(`profileImage_${currentUser.uid}`);
    if (storedImage) {
      setUploadedImage(storedImage);
      setProfilePicOption('upload');
    }
    
    // Check if user has selected avatar
    const storedAvatar = localStorage.getItem(`profileAvatar_${currentUser.uid}`);
    if (storedAvatar) {
      setSelectedAvatar(JSON.parse(storedAvatar));
      setProfilePicOption('avatar');
    }
    
    // Check if user has custom avatar
    const storedCustomAvatar = localStorage.getItem(`customAvatar_${currentUser.uid}`);
    if (storedCustomAvatar) {
      setCustomAvatar(JSON.parse(storedCustomAvatar));
      setProfilePicOption('custom');
    }
  }, [navigate]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setUploadedImage(imageData);
        setProfilePicOption('upload');
        localStorage.setItem(`profileImage_${user.uid}`, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setProfilePicOption('avatar');
    localStorage.setItem(`profileAvatar_${user.uid}`, JSON.stringify(avatar));
  };

  const handleSaveCustomAvatar = (avatarConfig) => {
    setCustomAvatar(avatarConfig);
    setProfilePicOption('custom');
    localStorage.setItem(`customAvatar_${user.uid}`, JSON.stringify(avatarConfig));
    setShowAvatarCreator(false);
    alert('✅ Custom avatar saved!');
  };

  const handleUpdateName = async () => {
    try {
      let photoURL = user.photoURL;
      
      // Update photo URL based on selection
      if (profilePicOption === 'upload' && uploadedImage) {
        photoURL = uploadedImage;
      } else if (profilePicOption === 'avatar' && selectedAvatar) {
        photoURL = null; // Will use avatar instead
      }
      
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });
      setEditing(false);
      alert('✅ Profile updated successfully!');
      window.location.reload(); // Refresh to update navbar
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Failed to update profile');
    }
  };

  const getCustomAvatarUrl = (config) => {
    return `https://avataaars.io/?avatarStyle=Transparent&topType=${config.topType}&accessoriesType=${config.accessoriesType}&hairColor=${config.hairColor}&facialHairType=${config.facialHairType}&clotheType=${config.clotheType}&clotheColor=${config.clotheColor}&eyeType=${config.eyeType}&eyebrowType=${config.eyebrowType}&mouthType=${config.mouthType}&skinColor=${config.skinColor}`;
  };

  const getCurrentProfilePic = () => {
    if (profilePicOption === 'custom' && customAvatar) {
      return <img src={getCustomAvatarUrl(customAvatar)} alt="Custom Avatar" />;
    } else if (profilePicOption === 'upload' && uploadedImage) {
      return <img src={uploadedImage} alt="Profile" />;
    } else if (profilePicOption === 'avatar' && selectedAvatar) {
      return (
        <div className="avatar-emoji" style={{ backgroundColor: selectedAvatar.color }}>
          <span>{selectedAvatar.emoji}</span>
        </div>
      );
    } else if (user.photoURL) {
      return <img src={user.photoURL} alt="Profile" />;
    } else {
      return (
        <div className="avatar-placeholder">
          {(user.displayName || user.email)[0].toUpperCase()}
        </div>
      );
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  if (showAvatarCreator) {
    return <AvatarCreator onSave={handleSaveCustomAvatar} initialAvatar={customAvatar} />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>👤 Profile</h1>
        
        <div className="profile-card">
          <div className="profile-avatar">
            {getCurrentProfilePic()}
          </div>

          {editing && (
            <div className="profile-pic-options">
              <h3>Choose Profile Picture</h3>
              <div className="pic-option-tabs">
                <button
                  className={profilePicOption === 'google' ? 'active' : ''}
                  onClick={() => setProfilePicOption('google')}
                >
                  Use Google Photo
                </button>
                <button
                  className={profilePicOption === 'upload' ? 'active' : ''}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </button>
                <button
                  className={profilePicOption === 'avatar' ? 'active' : ''}
                  onClick={() => setProfilePicOption('avatar')}
                >
                  Choose Avatar
                </button>
                <button
                  className={profilePicOption === 'custom' ? 'active' : ''}
                  onClick={() => setShowAvatarCreator(true)}
                >
                  Create Avatar
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
              />

              {profilePicOption === 'avatar' && (
                <div className="avatar-grid">
                  {avatarOptions.map(avatar => (
                    <div
                      key={avatar.id}
                      className={`avatar-option ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
                      style={{ backgroundColor: avatar.color }}
                      onClick={() => handleAvatarSelect(avatar)}
                    >
                      <span>{avatar.emoji}</span>
                      <p>{avatar.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
