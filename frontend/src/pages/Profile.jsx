// src/pages/Profile.jsx
// The logged-in user can update their profile and change their password.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';

const roleDescriptions = {
  adopter: 'You can browse pets and submit adoption applications.',
  shelter: 'You can manage pets, review applications, keep medical records and set reminders.',
  admin: 'You can verify shelters and see platform-wide information.',
};

export default function Profile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    shelterName: user.shelterName || '',
    shelterDescription: user.shelterDescription || '',
  });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function handleProfileChange(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  }

  function handlePasswordChange(event) {
    setPassword({ ...password, [event.target.name]: event.target.value });
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileError('');
    setProfileNotice('');
    setSavingProfile(true);

    try {
      const response = await api.put('/users/profile', profile);
      setUser(response.data.user);
      setProfileNotice('Profile updated successfully.');
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError('');
    setPasswordNotice('');

    if (password.newPassword.length < 6) {
      setPasswordError('The new password must be at least 6 characters.');
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await api.put('/users/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPasswordNotice(response.data.message);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="container page narrow-page">
      <PageHeader
        eyebrow="Your account"
        title="Profile settings"
        subtitle="Update your contact details and password."
      />

      <section className="card profile-summary">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <div className="profile-badges">
            <span className="role-badge">{roleLabel(user.role)}</span>
            {user.role === 'shelter' && <StatusBadge status={user.verificationStatus} />}
          </div>
        </div>
        <p className="profile-role-text">{roleDescriptions[user.role]}</p>
      </section>

      {user.role === 'shelter' && (
        <div className="banner banner-info">
          <p>
            Shelter verification status: <StatusBadge status={user.verificationStatus} />
          </p>
          <Link to="/shelter/verification" className="btn btn-outline btn-small">
            Manage verification
          </Link>
        </div>
      )}

      <div className="detail-columns">
        <section className="card">
          <h2>Profile details</h2>

          <Alert type="error" onClose={() => setProfileError('')}>
            {profileError}
          </Alert>
          <Alert type="success" onClose={() => setProfileNotice('')}>
            {profileNotice}
          </Alert>

          <form className="form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input value={user.email} disabled />
              <p className="form-hint">Email cannot be changed in this simple project.</p>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
              />
            </div>

            {user.role === 'shelter' && (
              <>
                <div className="form-group">
                  <label htmlFor="shelterName">Shelter name</label>
                  <input
                    id="shelterName"
                    name="shelterName"
                    value={profile.shelterName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shelterDescription">Shelter description</label>
                  <textarea
                    id="shelterDescription"
                    name="shelterDescription"
                    rows="3"
                    value={profile.shelterDescription}
                    onChange={handleProfileChange}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Change password</h2>

          <Alert type="error" onClose={() => setPasswordError('')}>
            {passwordError}
          </Alert>
          <Alert type="success" onClose={() => setPasswordNotice('')}>
            {passwordNotice}
          </Alert>

          <form className="form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={password.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={password.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-outline" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
