// src/pages/Reminders.jsx
// Shelter care reminders. A backend checker sends a notification when one is due.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { formatDate, isOverdue } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({ petId: '', title: '', notes: '', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadReminders() {
    const response = await api.get('/reminders');
    setReminders(response.data.reminders);
  }

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/reminders'), api.get('/pets/mine')])
      .then(([remindersResponse, petsResponse]) => {
        if (!active) return;
        setReminders(remindersResponse.data.reminders);
        setPets(petsResponse.data.pets);
        setForm((current) => ({
          ...current,
          petId: petsResponse.data.pets[0]?._id || '',
        }));
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

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await api.post('/reminders', form);
      setNotice('Reminder created. You will get a notification when it is due.');
      setForm({ ...form, title: '', notes: '', dueDate: '' });
      await loadReminders();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(reminder) {
    setBusyId(reminder._id);
    setError('');

    try {
      const response = await api.put(`/reminders/${reminder._id}`, {
        isDone: !reminder.isDone,
      });

      // Keep the populated pet object from the current state.
      setReminders(
        reminders.map((item) =>
          item._id === reminder._id
            ? { ...item, isDone: response.data.reminder.isDone }
            : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(reminder) {
    if (!window.confirm(`Delete the reminder "${reminder.title}"?`)) return;

    try {
      await api.delete(`/reminders/${reminder._id}`);
      setReminders(reminders.filter((item) => item._id !== reminder._id));
      setNotice('Reminder deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading reminders..." />
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="container page">
        <PageHeader eyebrow="Care reminders" title="Reminders" />
        <EmptyState
          icon="🐾"
          title="Add a pet first"
          text="Care reminders belong to a pet. Add a pet to your shelter, then come back here."
        >
          <Link to="/shelter/pets/new" className="btn btn-primary">
            Add a pet
          </Link>
        </EmptyState>
      </div>
    );
  }

  const openCount = reminders.filter((item) => !item.isDone).length;

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Care reminders"
        title="Reminders"
        subtitle={`${openCount} open reminder${openCount === 1 ? '' : 's'}. The server checks due reminders every minute.`}
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
            <h2>All reminders</h2>
            <span className="count-pill">{reminders.length}</span>
          </div>

          {reminders.length === 0 ? (
            <EmptyState
              icon="⏰"
              title="No reminders yet"
              text="Create one for a vaccination, medicine or grooming appointment."
            />
          ) : (
            <div className="reminder-list">
              {reminders.map((reminder) => (
                <div
                  className={`reminder-item ${reminder.isDone ? 'done' : ''} ${
                    !reminder.isDone && isOverdue(reminder.dueDate) ? 'overdue' : ''
                  }`}
                  key={reminder._id}
                >
                  <div className="reminder-main">
                    <div className="reminder-top">
                      <h4>{reminder.title}</h4>
                      {!reminder.isDone && isOverdue(reminder.dueDate) && (
                        <span className="overdue-label">Overdue</span>
                      )}
                      {reminder.isDone && <span className="done-label">Done</span>}
                    </div>
                    <p className="muted small">
                      🐾 {reminder.pet?.name || 'Pet'} • Due {formatDate(reminder.dueDate)}
                    </p>
                    {reminder.notes && <p>{reminder.notes}</p>}
                  </div>

                  <div className="reminder-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      disabled={busyId === reminder._id}
                      onClick={() => toggleDone(reminder)}
                    >
                      {reminder.isDone ? 'Reopen' : 'Mark done'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(reminder)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Add a reminder</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="petId">Pet *</label>
              <select id="petId" name="petId" value={form.petId} onChange={handleChange} required>
                {pets.map((pet) => (
                  <option value={pet._id} key={pet._id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Reminder title *</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Rabies booster"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due date *</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                required
              />
              <p className="form-hint">
                On the due date, the reminder checker creates an in-app notification for you.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional details"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create reminder'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
