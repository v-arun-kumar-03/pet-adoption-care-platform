// src/pages/AdopterDashboard.jsx
// Adopter's home page: application counts and the full application list.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function AdopterDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/dashboard'), api.get('/applications/mine')])
      .then(([dashboardResponse, applicationsResponse]) => {
        if (!active) return;
        setDashboard(dashboardResponse.data);
        setApplications(applicationsResponse.data.applications);
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
        <Loading message="Loading your dashboard..." />
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Adopter dashboard"
        title={`Hello, ${user.name.split(' ')[0]} 👋`}
        subtitle="Follow your adoption applications and find your next companion."
        actions={
          <Link to="/pets" className="btn btn-primary">
            Browse pets
          </Link>
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      <div className="stats-grid">
        <StatCard icon="📝" label="Applications" value={stats.totalApplications ?? 0} />
        <StatCard icon="⏳" label="Pending" value={stats.pendingApplications ?? 0} tone="amber" />
        <StatCard icon="🎉" label="Approved" value={stats.approvedApplications ?? 0} tone="green" />
        <StatCard icon="🐾" label="Pets available" value={stats.availablePets ?? 0} tone="blue" />
      </div>

      <section className="section-inner">
        <div className="card-heading">
          <h2>My applications</h2>
          <span className="count-pill">{applications.length}</span>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No applications yet"
            text="When you apply to adopt a pet, it will appear here."
          >
            <Link to="/pets" className="btn btn-primary">
              Find a pet
            </Link>
          </EmptyState>
        ) : (
          <div className="application-list">
            {applications.map((application) => (
              <article className="application-card card" key={application._id}>
                <div className="application-main">
                  <div className="application-pet">
                    <img
                      src={application.pet?.imageUrl || '/pet-placeholder.svg'}
                      alt={application.pet?.name || 'Pet'}
                      onError={(event) => {
                        event.currentTarget.src = '/pet-placeholder.svg';
                      }}
                    />
                    <div>
                      <h3>
                        {application.pet ? (
                          <Link to={`/pets/${application.pet._id}`}>{application.pet.name}</Link>
                        ) : (
                          'Pet no longer listed'
                        )}
                      </h3>
                      <p className="muted small">
                        {application.pet?.species} • Applied {formatDate(application.createdAt)}
                      </p>
                      <p className="muted small">
                        Shelter: {application.shelter?.shelterName || application.shelter?.name}
                      </p>
                    </div>
                  </div>

                  <div className="application-side">
                    <StatusBadge status={application.status} />
                    {application.reviewedAt && (
                      <small className="muted">Reviewed {formatDate(application.reviewedAt)}</small>
                    )}
                  </div>
                </div>

                {application.reviewNote && (
                  <p className="review-note">💬 {application.reviewNote}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
