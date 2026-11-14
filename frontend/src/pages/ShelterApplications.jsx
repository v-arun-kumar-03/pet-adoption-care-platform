// src/pages/ShelterApplications.jsx
// Shelter reviews adoption applications and approves/rejects them.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function ShelterApplications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  async function loadApplications(showLoader = false) {
    if (showLoader) setLoading(true);

    try {
      const response = await api.get('/applications/shelter');
      setApplications(response.data.applications);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications(true);
  }, []);

  async function handleApprove(application) {
    const confirmed = window.confirm(
      `Approve ${application.adopter?.name}'s application to adopt ${application.pet?.name}?\n\nThe pet will be marked as adopted and other pending applications will be rejected.`
    );

    if (!confirmed) return;

    setBusyId(application._id);
    setError('');
    setNotice('');

    try {
      const response = await api.put(`/applications/${application._id}/approve`, {});
      setNotice(response.data.message);
      await loadApplications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function handleReject(application) {
    const note = window.prompt(
      `Why are you rejecting ${application.adopter?.name}'s application? (optional)`,
      'Another applicant was a better match for this pet.'
    );

    if (note === null) return; // the shelter pressed Cancel

    setBusyId(application._id);
    setError('');
    setNotice('');

    try {
      const response = await api.put(`/applications/${application._id}/reject`, {
        reviewNote: note,
      });
      setNotice(response.data.message);
      await loadApplications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  const counts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === 'pending').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
  };

  const visibleApplications =
    filter === 'all' ? applications : applications.filter((app) => app.status === filter);

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Adoption inbox"
        title="Applications"
        subtitle="Review each adopter's details and respond. Approving one application marks the pet as adopted."
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      <div className="tabs" role="tablist" aria-label="Filter applications">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            type="button"
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="tab-count">{counts[status]}</span>
          </button>
        ))}
      </div>

      {visibleApplications.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No applications here"
          text={
            applications.length === 0
              ? 'Applicants will appear here once someone applies for one of your pets.'
              : 'There are no applications with this status.'
          }
        >
          <Link to="/shelter/pets" className="btn btn-outline">
            Manage my pets
          </Link>
        </EmptyState>
      ) : (
        <div className="applications-grid">
          {visibleApplications.map((application) => (
            <article className="application-full card" key={application._id}>
              <div className="application-full-head">
                <div className="application-pet">
                  <img
                    src={application.pet?.imageUrl || '/pet-placeholder.svg'}
                    alt={application.pet?.name || 'Pet'}
                    onError={(event) => {
                      event.currentTarget.src = '/pet-placeholder.svg';
                    }}
                  />
                  <div>
                    <p className="eyebrow">Application for</p>
                    <h3>{application.pet?.name || 'Pet removed'}</h3>
                    <p className="muted small">
                      {application.pet?.species} • Applied {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="applicant-grid">
                <div>
                  <span className="label">Applicant</span>
                  <strong>{application.adopter?.name}</strong>
                </div>
                <div>
                  <span className="label">Email</span>
                  <a href={`mailto:${application.adopter?.email}`}>{application.adopter?.email}</a>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <strong>{application.phone}</strong>
                </div>
                <div>
                  <span className="label">Address</span>
                  <strong>{application.address}</strong>
                </div>
                <div>
                  <span className="label">Home type</span>
                  <strong>{application.homeType}</strong>
                </div>
                <div>
                  <span className="label">Other pets</span>
                  <strong>{application.hasOtherPets}</strong>
                </div>
              </div>

              {application.experience && (
                <div className="quote-box">
                  <span className="label">Experience</span>
                  <p>{application.experience}</p>
                </div>
              )}

              <div className="quote-box">
                <span className="label">Message to the shelter</span>
                <p>“{application.message}”</p>
              </div>

              {application.reviewNote && (
                <p className="review-note">💬 {application.reviewNote}</p>
              )}

              {application.status === 'pending' && (
                <div className="application-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busyId === application._id}
                    onClick={() => handleApprove(application)}
                  >
                    {busyId === application._id ? 'Please wait...' : 'Approve application'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={busyId === application._id}
                    onClick={() => handleReject(application)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
