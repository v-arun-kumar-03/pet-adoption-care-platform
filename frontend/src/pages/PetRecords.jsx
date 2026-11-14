// src/pages/PetRecords.jsx
// Shelter page for medical and vaccination records of one pet.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyRecord = {
  type: 'Checkup',
  title: '',
  description: '',
  recordDate: today(),
  vetName: '',
  nextDueDate: '',
};

export default function PetRecords() {
  const { id } = useParams();

  const [petName, setPetName] = useState('');
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyRecord);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadRecords() {
    try {
      const response = await api.get(`/pets/${id}/records`);
      setRecords(response.data.records);
      setPetName(response.data.pet.name);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [id]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await api.post(`/pets/${id}/records`, {
        ...form,
        nextDueDate: form.nextDueDate || undefined,
      });
      setNotice('Medical record added.');
      setForm({ ...emptyRecord, recordDate: today() });
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`Delete the record "${record.title}"?`)) return;

    try {
      await api.delete(`/records/${record._id}`);
      setRecords(records.filter((item) => item._id !== record._id));
      setNotice('Medical record deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading medical records..." />
      </div>
    );
  }

  return (
    <div className="container page">
      <Link to="/shelter/pets" className="back-link">
        ← Back to my pets
      </Link>

      <PageHeader
        eyebrow="Medical care"
        title={`${petName || 'Pet'} — medical records`}
        subtitle="Keep checkups and vaccinations in one place. Add a next due date to plan future care."
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      <div className="detail-columns">
        <section className="card">
          <div className="card-heading">
            <h2>Records</h2>
            <span className="count-pill">{records.length}</span>
          </div>

          {records.length === 0 ? (
            <EmptyState
              icon="🩺"
              title="No records yet"
              text="Add the first checkup or vaccination using the form."
            />
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
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(record)}
                  >
                    Delete record
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Add a record</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="type">Record type</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="Checkup">Checkup</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Treatment">Treatment</option>
                <option value="Surgery">Surgery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Rabies vaccination"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Notes about the visit or treatment"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="recordDate">Record date *</label>
                <input
                  id="recordDate"
                  name="recordDate"
                  type="date"
                  value={form.recordDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="vetName">Vet name</label>
                <input
                  id="vetName"
                  name="vetName"
                  value={form.vetName}
                  onChange={handleChange}
                  placeholder="Dr. ..."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nextDueDate">Next due date (optional)</label>
              <input
                id="nextDueDate"
                name="nextDueDate"
                type="date"
                value={form.nextDueDate}
                onChange={handleChange}
              />
              <p className="form-hint">
                Useful for vaccinations or follow-up visits. Care reminders can also be added from
                the Reminders page.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add record'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
