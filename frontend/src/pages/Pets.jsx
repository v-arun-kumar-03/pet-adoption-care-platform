// src/pages/Pets.jsx
// Public pet browsing page with search and simple filters.

import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import PetCard from '../components/PetCard';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

const defaultFilters = {
  search: '',
  species: '',
  status: 'available',
  location: '',
  maxAge: '',
};

export default function Pets() {
  const [draft, setDraft] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch pets whenever the applied filters change.
  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    const params = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params[key] = filters[key];
    });

    api
      .get('/pets', { params })
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
  }, [filters]);

  function handleChange(event) {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  }

  function handleSearch(event) {
    event.preventDefault();
    setFilters({ ...draft });
  }

  function handleReset() {
    setDraft(defaultFilters);
    setFilters(defaultFilters);
  }

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Adopt with love"
        title="Find your perfect companion"
        subtitle="Search our available pets by species, age or city. Every pet comes from a verified shelter."
      />

      <form className="filter-bar" onSubmit={handleSearch}>
        <div className="form-group filter-search">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            name="search"
            value={draft.search}
            onChange={handleChange}
            placeholder="Name, breed or keyword"
          />
        </div>

        <div className="form-group">
          <label htmlFor="species">Species</label>
          <select id="species" name="species" value={draft.species} onChange={handleChange}>
            <option value="">All species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={draft.status} onChange={handleChange}>
            <option value="available">Available</option>
            <option value="">All statuses</option>
            <option value="adopted">Adopted</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            value={draft.location}
            onChange={handleChange}
            placeholder="City"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxAge">Maximum age</label>
          <input
            id="maxAge"
            name="maxAge"
            type="number"
            min="0"
            value={draft.maxAge}
            onChange={handleChange}
            placeholder="Years"
          />
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      <div className="results-heading">
        <p className="result-count">
          {loading ? 'Searching...' : `${pets.length} pet${pets.length === 1 ? '' : 's'} found`}
        </p>
      </div>

      {loading ? (
        <Loading message="Finding pets..." />
      ) : pets.length > 0 ? (
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔎"
          title="No pets match your search"
          text="Try a different species, location or age, or reset the filters."
        >
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Clear filters
          </button>
        </EmptyState>
      )}
    </div>
  );
}
