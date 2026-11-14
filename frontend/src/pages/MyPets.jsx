// src/pages/MyPets.jsx
// Shelter page that lists its own pets with edit/delete actions.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatAge } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function MyPets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/pets/mine')
      .then((response) => {
        if (active) setPets(response.data.pets);
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

  async function handleDelete(pet) {
    const confirmed = window.confirm(
      `Delete ${pet.name}? This also removes related applications, medical records and reminders.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/pets/${pet._id}`);
      setPets(pets.filter((item) => item._id !== pet._id));
      setNotice(`${pet.name} was deleted.`);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Shelter pets"
        title="My pets"
        subtitle="Every pet listed under your shelter. Keep their information up to date."
        actions={
          <Link to="/shelter/pets/new" className="btn btn-primary">
            + Add a pet
          </Link>
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      {user.verificationStatus !== 'approved' && (
        <div className="banner banner-warning">
          <p>
            Your shelter is not verified yet, so adding pets will be blocked. Upload documents in
            the verification page.
          </p>
          <Link to="/shelter/verification" className="btn btn-outline btn-small">
            Go to verification
          </Link>
        </div>
      )}

      {loading ? (
        <Loading message="Loading your pets..." />
      ) : pets.length === 0 ? (
        <EmptyState
          icon="🐾"
          title="No pets added yet"
          text="Add your first pet so adopters can meet them."
        >
          <Link to="/shelter/pets/new" className="btn btn-primary">
            Add a pet
          </Link>
        </EmptyState>
      ) : (
        <div className="table-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Species / breed</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id}>
                  <td>
                    <div className="table-pet">
                      <img
                        src={pet.imageUrl || '/pet-placeholder.svg'}
                        alt={pet.name}
                        onError={(event) => {
                          event.currentTarget.src = '/pet-placeholder.svg';
                        }}
                      />
                      <div>
                        <strong>{pet.name}</strong>
                        <small>📍 {pet.location}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {pet.species}
                    <br />
                    <small className="muted">{pet.breed}</small>
                  </td>
                  <td>{formatAge(pet.age)}</td>
                  <td>
                    <StatusBadge status={pet.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/shelter/pets/${pet._id}/edit`}
                        className="btn btn-outline btn-small"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/shelter/pets/${pet._id}/records`}
                        className="btn btn-outline btn-small"
                      >
                        Records
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(pet)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
