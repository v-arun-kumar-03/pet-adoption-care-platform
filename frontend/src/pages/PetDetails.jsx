// src/pages/PetDetails.jsx
// Shows full pet information, medical records and the adoption form.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatAge, formatDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

const emptyForm = {
  phone: '',
  address: '',
  homeType: 'Apartment',
  hasOtherPets: 'No',
  experience: '',
  message: '',
};

export default function PetDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [myApplication, setMyApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Load the pet whenever the id in the URL changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api
      .get(`/pets/${id}`)
      .then((response) => {
        if (active) setPet(response.data.pet);
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err));
          setPet(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Prefill the application form with saved profile details.
  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      phone: current.phone || user.phone || '',
      address: current.address || user.address || '',
    }));
  }, [user]);

  // Medical records need a login.
  useEffect(() => {
    if (!user) {
      setRecords([]);
      return;
    }

    api
      .get(`/pets/${id}/records`)
      .then((response) => setRecords(response.data.records))
      .catch(() => setRecords([]));
  }, [id, user]);

  // Check if this adopter already applied for this pet.
  useEffect(() => {
    if (!user || user.role !== 'adopter') {
      setMyApplication(null);
      return;
    }

    api
      .get('/applications/mine')
      .then((response) => {
        const found = response.data.applications.find(
          (application) => application.pet && application.pet._id === id
        );
        setMyApplication(found || null);
      })
      .catch(() => setMyApplication(null));
  }, [id, user]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleApply(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const response = await api.post('/applications', {
        petId: pet._id,
        ...form,
      });

      setNotice('Your application was submitted. You can track it in My Applications.');
      setMyApplication(response.data.application);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading pet details..." />
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="container page">
        <EmptyState icon="😿" title="Pet not found" text={error}>
          <Link to="/pets" className="btn btn-primary">
            Browse other pets
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container page">
        <EmptyState title="Pet not found">
          <Link to="/pets" className="btn btn-primary">
            Browse other pets
          </Link>
        </EmptyState>
      </div>
    );
  }

  const isShelterOwner =
    user &&
    user.role === 'shelter' &&
    pet.shelter &&
    pet.shelter._id === user._id;

  return (
    <div className="container page">
      <Link to="/pets" className="back-link">
        ← Back to all pets
      </Link>

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      <div className="pet-detail-top">
        <div className="pet-detail-image">
          <img
            src={pet.imageUrl || '/pet-placeholder.svg'}
            alt={`${pet.name} the ${pet.species}`}
            onError={(event) => {
              event.currentTarget.src = '/pet-placeholder.svg';
            }}
          />
          <StatusBadge status={pet.status} />
        </div>

        <div className="pet-detail-info">
          <div className="pet-detail-heading">
            <div>
              <p className="eyebrow">
                {pet.species} • {pet.breed}
              </p>
              <h1>{pet.name}</h1>
            </div>
            <StatusBadge status={pet.status} />
          </div>

          <div className="detail-chips">
            <span className="chip">🎂 {formatAge(pet.age)}</span>
            <span className="chip">⚥ {pet.gender}</span>
            <span className="chip">📏 {pet.size}</span>
            <span className="chip">📍 {pet.location}</span>
            <span className="chip">
              {pet.vaccinated ? '💉 Vaccinated' : '💉 Vaccination pending'}
            </span>
          </div>

          <p className="pet-description">{pet.description}</p>

          <div className="shelter-box">
            <div>
              <p className="eyebrow">Cared for by</p>
              <h3>🏠 {pet.shelter?.shelterName || pet.shelter?.name || 'Shelter'}</h3>
              {pet.shelter?.address && <p className="muted">{pet.shelter.address}</p>}
            </div>
            <div className="shelter-contact">
              {pet.shelter?.email && <a href={`mailto:${pet.shelter.email}`}>{pet.shelter.email}</a>}
              {pet.shelter?.phone && <span>{pet.shelter.phone}</span>}
            </div>
          </div>

          {isShelterOwner && (
            <div className="owner-actions">
              <Link to={`/shelter/pets/${pet._id}/edit`} className="btn btn-outline btn-small">
                Edit this pet
              </Link>
              <Link
                to={`/shelter/pets/${pet._id}/records`}
                className="btn btn-outline btn-small"
              >
                Manage medical records
              </Link>
            </div>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-link">
              Open admin panel →
            </Link>
          )}
        </div>
      </div>

      <div className="detail-columns">
        {/* ---------- MEDICAL RECORDS ---------- */}
        <section className="card">
          <div className="card-heading">
            <h2>Medical &amp; vaccination records</h2>
            <span className="count-pill">{records.length}</span>
          </div>

          {!user ? (
            <div className="login-prompt">
              <p>Medical records are available to logged-in users.</p>
              <Link
                to="/login"
                state={{ from: `/pets/${pet._id}` }}
                className="btn btn-outline btn-small"
              >
                Log in to view
              </Link>
            </div>
          ) : records.length === 0 ? (
            <p className="muted">No medical records have been added for {pet.name} yet.</p>
          ) : (
            <div className="record-list">
              {records.map((record) => (
                <div className="record-item" key={record._id}>
                  <div className="record-top">
                    <h4>{record.title}</h4>
                    <span className="type-chip">{record.type}</span>
                  </div>
                  {record.description && <p>{record.description}</p>}
                  <div className="record-meta">
                    <span>📅 {formatDate(record.recordDate)}</span>
                    {record.vetName && <span>🩺 {record.vetName}</span>}
                    {record.nextDueDate && <span>⏰ Next due {formatDate(record.nextDueDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------- ADOPTION ---------- */}
        <section className="card adopt-card" id="apply">
          <h2>Adopt {pet.name}</h2>

          {pet.status === 'adopted' ? (
            <div className="adopted-note">
              <span>🎉</span>
              <div>
                <h3>{pet.name} has found a forever home!</h3>
                <p>This pet is no longer accepting applications. Please look at our other pets.</p>
                <Link to="/pets" className="btn btn-outline btn-small">
                  Meet other pets
                </Link>
              </div>
            </div>
          ) : !user ? (
            <div className="login-prompt">
              <p>Log in with an adopter account to apply for {pet.name}.</p>
              <div className="login-prompt-actions">
                <Link
                  to="/login"
                  state={{ from: `/pets/${pet._id}` }}
                  className="btn btn-primary btn-small"
                >
                  Log in
                </Link>
                <Link to="/register" className="btn btn-outline btn-small">
                  Create account
                </Link>
              </div>
            </div>
          ) : user.role !== 'adopter' ? (
            <p className="muted">
              You are logged in as a {user.role}. Only adopter accounts can submit adoption
              applications.
            </p>
          ) : myApplication ? (
            <div className={`application-status-box status-box-${myApplication.status}`}>
              <div className="status-box-top">
                <p className="eyebrow">Your application</p>
                <StatusBadge status={myApplication.status} />
              </div>

              <p>
                Submitted on {formatDate(myApplication.createdAt)}
                {myApplication.reviewedAt
                  ? ` • Reviewed on ${formatDate(myApplication.reviewedAt)}`
                  : ''}
              </p>

              {myApplication.reviewNote && (
                <p className="review-note">💬 {myApplication.reviewNote}</p>
              )}

              {myApplication.status === 'pending' && (
                <p className="muted small">
                  The shelter will review your application soon. You can follow it from your
                  dashboard.
                </p>
              )}

              {myApplication.status === 'rejected' && pet.status === 'available' && (
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() => {
                    setMyApplication(null);
                    setNotice('');
                  }}
                >
                  Apply again
                </button>
              )}

              <Link to="/adopter" className="text-link">
                Go to my applications →
              </Link>
            </div>
          ) : (
            <form className="form" onSubmit={handleApply}>
              <p className="muted small">
                Tell the shelter a little about your home. Fields marked * are required.
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="phone">Phone number *</label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="homeType">Home type</label>
                  <select id="homeType" name="homeType" value={form.homeType} onChange={handleChange}>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Farm">Farm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hasOtherPets">Other pets at home?</label>
                  <select
                    id="hasOtherPets"
                    name="hasOtherPets"
                    value={form.hasOtherPets}
                    onChange={handleChange}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Pet experience</label>
                <input
                  id="experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Optional: tell us about pets you have cared for"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Why would you like to adopt? *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write a short message to the shelter (at least 10 characters)"
                  minLength={10}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
