// src/pages/AdminDashboard.jsx
// Admin page: platform numbers, shelter verification and user list.

import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { formatDate, formatFileSize } from '../utils/format';
import { openPrivateDocument } from '../utils/documents';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  async function loadAll() {
    const [dashboardResponse, sheltersResponse, usersResponse] = await Promise.all([
      api.get('/dashboard'),
      api.get('/admin/shelters'),
      api.get('/admin/users'),
    ]);

    setDashboard(dashboardResponse.data);
    setShelters(sheltersResponse.data.shelters);
    setUsers(usersResponse.data.users);
  }

  useEffect(() => {
    let active = true;

    loadAll()
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

  async function handleVerify(shelter, status) {
    let note = '';

    if (status === 'rejected') {
      const answer = window.prompt(
        `Why are you rejecting ${shelter.shelterName}'s verification?`,
        'The uploaded documents were not clear enough.'
      );
      if (answer === null) return;
      note = answer;
    } else {
      const confirmed = window.confirm(
        `Approve ${shelter.shelterName}? They will be able to add pets immediately.`
      );
      if (!confirmed) return;
      note = 'Your shelter has been verified.';
    }

    setBusyId(shelter._id);
    setError('');
    setNotice('');

    try {
      const response = await api.put(`/admin/shelters/${shelter._id}/verify`, {
        status,
        note,
      });
      setNotice(response.data.message);
      await loadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function handleViewDocument(document) {
    try {
      await openPrivateDocument(document.filename);
    } catch (err) {
      setError('Could not open this document. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading admin panel..." />
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentApplications = dashboard?.recentApplications || [];
  const pendingShelters = shelters.filter(
    (shelter) => shelter.verificationStatus === 'pending'
  );

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Admin panel"
        title="Platform overview"
        subtitle="Verify shelters and keep an eye on pets and adoption activity."
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`tab ${tab === 'shelters' ? 'active' : ''}`}
          onClick={() => setTab('shelters')}
        >
          Shelters
          {pendingShelters.length > 0 && <span className="tab-count">{pendingShelters.length}</span>}
        </button>
        <button
          type="button"
          className={`tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            <StatCard icon="👥" label="Total users" value={stats.totalUsers ?? 0} />
            <StatCard icon="🐾" label="Total pets" value={stats.totalPets ?? 0} tone="green" />
            <StatCard
              icon="📝"
              label="Applications"
              value={stats.totalApplications ?? 0}
              tone="blue"
            />
            <StatCard
              icon="🛡️"
              label="Pending shelters"
              value={stats.pendingShelters ?? 0}
              tone="amber"
            />
          </div>

          {pendingShelters.length > 0 && (
            <div className="verification-banner">
              <div className="verification-banner-icon">🛡️</div>
              <div>
                <h3>
                  {pendingShelters.length} shelter{pendingShelters.length === 1 ? '' : 's'} waiting
                  for verification
                </h3>
                <p>Review their uploaded documents and approve or reject each one.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => setTab('shelters')}
              >
                Review shelters
              </button>
            </div>
          )}

          <div className="dashboard-columns">
            <section className="card">
              <div className="card-heading">
                <h2>Recent applications</h2>
                <span className="count-pill">{recentApplications.length}</span>
              </div>

              {recentApplications.length === 0 ? (
                <p className="muted">No applications yet.</p>
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
                          {application.shelter?.shelterName || application.shelter?.name} •{' '}
                          {formatDate(application.createdAt)}
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
                <h2>Platform numbers</h2>
              </div>
              <div className="number-list">
                <div>
                  <span>Verified shelters</span>
                  <strong>{stats.totalShelters ?? 0}</strong>
                </div>
                <div>
                  <span>Available pets</span>
                  <strong>{stats.availablePets ?? 0}</strong>
                </div>
                <div>
                  <span>Adopted pets</span>
                  <strong>{stats.adoptedPets ?? 0}</strong>
                </div>
                <div>
                  <span>Pending applications</span>
                  <strong>{stats.pendingApplications ?? 0}</strong>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {tab === 'shelters' && (
        <div className="shelter-list">
          {shelters.length === 0 ? (
            <EmptyState title="No shelters registered" />
          ) : (
            shelters.map((shelter) => (
              <article className="card shelter-card" key={shelter._id}>
                <div className="shelter-card-head">
                  <div>
                    <p className="eyebrow">Shelter</p>
                    <h3>{shelter.shelterName || shelter.name}</h3>
                    <p className="muted small">
                      {shelter.name} • {shelter.email}
                    </p>
                    <p className="muted small">
                      {shelter.phone || 'No phone'} • {shelter.address || 'No address'}
                    </p>
                  </div>
                  <StatusBadge status={shelter.verificationStatus} />
                </div>

                {shelter.shelterDescription && (
                  <p className="muted">{shelter.shelterDescription}</p>
                )}

                <div className="document-list">
                  <h4>Documents ({shelter.documents.length})</h4>
                  {shelter.documents.length === 0 ? (
                    <p className="muted small">No documents uploaded yet.</p>
                  ) : (
                    shelter.documents.map((document) => (
                      <div className="document-row" key={document.filename}>
                        <div>
                          <strong>📄 {document.originalName}</strong>
                          <small>
                            {formatFileSize(document.size)} •{' '}
                            {formatDate(document.uploadedAt)}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={() => handleViewDocument(document)}
                        >
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {shelter.verificationNote && (
                  <p className="review-note">💬 {shelter.verificationNote}</p>
                )}

                <div className="application-actions">
                  {shelter.verificationStatus !== 'approved' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      disabled={
                        busyId === shelter._id || shelter.documents.length === 0
                      }
                      onClick={() => handleVerify(shelter, 'approved')}
                      title={
                        shelter.documents.length === 0
                          ? 'The shelter must upload at least one document first'
                          : 'Approve this shelter'
                      }
                    >
                      {busyId === shelter._id ? 'Saving...' : 'Approve shelter'}
                    </button>
                  )}

                  {shelter.verificationStatus === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      disabled={busyId === shelter._id}
                      onClick={() => handleVerify(shelter, 'rejected')}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="table-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.email}</td>
                  <td className="capitalize">{item.role}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    {item.role === 'shelter' ? (
                      <StatusBadge status={item.verificationStatus} />
                    ) : (
                      <span className="muted small">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="muted">No users found.</p>}
        </div>
      )}
    </div>
  );
}
