// src/pages/ShelterDashboard.jsx
// Shelter home page: verification status, numbers, applications and reminders.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function ShelterDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/dashboard')
      .then((response) => {
        if (active) setDashboard(response.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading shelter dashboard..." />
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentApplications = dashboard?.recentApplications || [];
  const reminders = dashboard?.upcomingReminders || [];
  const isVerified = stats.verificationStatus === 'approved';

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Shelter dashboard"
        title={user.shelterName || user.name}
        subtitle="Manage your pets, adoption applications and daily care tasks."
        actions={
          isVerified ? (
            <Link to="/shelter/pets/new" className="btn btn-primary">
              + Add a pet
            </Link>
          ) : (
            <Link to="/shelter/verification" className="btn btn-primary">
              Complete verification
            </Link>
          )
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {!isVerified && (
        <div className="verification-banner">
          <div className="verification-banner-icon">🔐</div>
          <div>
            <div className="verification-title">
              <h3>Shelter verification</h3>
              <StatusBadge status={stats.verificationStatus || 'not_submitted'} />
            </div>
            <p>
              {user.verificationNote ||
                'Upload your shelter licence or registration document. An admin will review it before you can add pets.'}
            </p>
          </div>
          <Link to="/shelter/verification" className="btn btn-primary btn-small">
            Manage documents
          </Link>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="🐾" label="Total pets" value={stats.totalPets ?? 0} />
        <StatCard icon="🏠" label="Available" value={stats.availablePets ?? 0} tone="green" />
        <StatCard icon="❤️" label="Adopted" value={stats.adoptedPets ?? 0} tone="pink" />
        <StatCard
          icon="📝"
          label="Pending applications"
          value={stats.pendingApplications ?? 0}
          tone="amber"
        />
      </div>

      <div className="quick-actions">
        <Link to="/shelter/pets" className="quick-card">
          <span>🐕</span>
          <div>
            <strong>My pets</strong>
            <small>Add, edit and update listings</small>
          </div>
        </Link>
        <Link to="/shelter/applications" className="quick-card">
          <span>📬</span>
          <div>
            <strong>Applications</strong>
            <small>Review and respond to adopters</small>
          </div>
        </Link>
        <Link to="/shelter/reminders" className="quick-card">
          <span>⏰</span>
          <div>
            <strong>Care reminders</strong>
            <small>Keep vaccinations and care on time</small>
          </div>
        </Link>
        <Link to="/shelter/verification" className="quick-card">
          <span>🔐</span>
          <div>
            <strong>Verification</strong>
            <small>Upload and manage documents</small>
          </div>
        </Link>
      </div>

      <div className="dashboard-columns">
        <section className="card">
          <div className="card-heading">
            <h2>Recent applications</h2>
            <Link to="/shelter/applications" className="text-link small">
              View all →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="muted">No applications yet. Add a pet to start receiving them.</p>
          ) : (
            <div className="compact-list">
              {recentApplications.map((application) => (
                <div className="compact-item" key={application._id}>
                  <img
                    src={application.pet?.imageUrl || '/pet-placeholder.svg'}
                    alt={application.pet?.name || 'Pet'}
                    onError={(event) => {
                      event.currentTarget.src = '/pet-placeholder.svg';
                    }}
                  />
                  <div className="compact-info">
                    <strong>
                      {application.adopter?.name} → {application.pet?.name}
                    </strong>
                    <small>
                      {formatDate(application.createdAt)} • {application.pet?.species}
                    </small>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-heading">
            <h2>Upcoming care</h2>
            <Link to="/shelter/reminders" className="text-link small">
              View all →
            </Link>
          </div>

          {reminders.length === 0 ? (
            <p className="muted">No open reminders. Nice work!</p>
          ) : (
            <div className="compact-list">
              {reminders.map((reminder) => (
                <div className="compact-item reminder-compact" key={reminder._id}>
                  <span className={`reminder-dot ${isOverdue(reminder.dueDate) ? 'overdue' : ''}`} />
                  <div className="compact-info">
                    <strong>{reminder.title}</strong>
                    <small>
                      {reminder.pet?.name} • {formatDate(reminder.dueDate)}
                    </small>
                  </div>
                  {isOverdue(reminder.dueDate) && <span className="overdue-label">Overdue</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
