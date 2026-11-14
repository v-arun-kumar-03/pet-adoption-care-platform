// src/pages/PetForm.jsx
// Used for both adding a new pet and editing an existing pet.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

const emptyPet = {
  name: '',
  species: 'Dog',
  breed: '',
  age: 1,
  gender: 'Male',
  size: 'Medium',
  description: '',
  imageUrl: '',
  location: '',
  vaccinated: false,
  status: 'available',
};

export default function PetForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyPet);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When editing, load the pet and check that it belongs to this shelter.
  useEffect(() => {
    if (!isEdit) return;

    let active = true;

    api
      .get(`/pets/${id}`)
      .then((response) => {
        if (!active) return;

        const pet = response.data.pet;

        if (pet.shelter && pet.shelter._id !== user._id) {
          setError('You can only edit pets that belong to your shelter.');
          return;
        }

        setForm({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          size: pet.size,
          description: pet.description,
          imageUrl: pet.imageUrl || '',
          location: pet.location || '',
          vaccinated: pet.vaccinated,
          status: pet.status,
        });
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
  }, [id, isEdit, user._id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      age: Number(form.age),
      vaccinated: Boolean(form.vaccinated),
    };

    try {
      if (isEdit) {
        await api.put(`/pets/${id}`, payload);
      } else {
        await api.post('/pets', payload);
      }

      navigate('/shelter/pets');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading pet..." />
      </div>
    );
  }

  return (
    <div className="container page narrow-page">
      <Link to="/shelter/pets" className="back-link">
        ← Back to my pets
      </Link>

      <PageHeader
        eyebrow="Shelter pets"
        title={isEdit ? `Edit ${form.name || 'pet'}` : 'Add a new pet'}
        subtitle={
          isEdit
            ? 'Update the listing. Marking a pet as adopted will close pending applications.'
            : 'Share clear details so adopters can get to know this pet.'
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {!isEdit && user.verificationStatus !== 'approved' && (
        <div className="banner banner-warning">
          <p>Your shelter is not verified yet. The server will block new pets until an admin approves your documents.</p>
          <Link to="/shelter/verification" className="btn btn-outline btn-small">
            Upload documents
          </Link>
        </div>
      )}

      <form className="card form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Pet name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="species">Species *</label>
            <select id="species" name="species" value={form.species} onChange={handleChange}>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Breed</label>
            <input
              id="breed"
              name="breed"
              value={form.breed}
              onChange={handleChange}
              placeholder="e.g. Golden Retriever"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age (years)</label>
            <input
              id="age"
              name="age"
              type="number"
              min="0"
              step="0.5"
              value={form.age}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="size">Size</label>
            <select id="size" name="size" value={form.size} onChange={handleChange}>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          {isEdit && (
            <div className="form-group">
              <label htmlFor="status">Adoption status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            placeholder="Personality, habits, medical needs and the kind of home they need..."
            minLength={10}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/pet-photo.jpg"
          />
          <p className="form-hint">
            Paste a link to a photo. If it cannot load, PawHaven shows a friendly placeholder.
          </p>
        </div>

        <div className="image-preview">
          <img
            src={form.imageUrl || '/pet-placeholder.svg'}
            alt="Pet preview"
            onError={(event) => {
              event.currentTarget.src = '/pet-placeholder.svg';
            }}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="vaccinated"
            checked={form.vaccinated}
            onChange={handleChange}
          />
          <span>This pet is vaccinated</span>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add pet'}
          </button>
          <Link to="/shelter/pets" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
