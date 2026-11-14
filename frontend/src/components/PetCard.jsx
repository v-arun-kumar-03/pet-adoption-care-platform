// src/components/PetCard.jsx
// Reusable summary card for a pet.

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatAge } from '../utils/format';

const speciesEmoji = {
  Dog: '🐶',
  Cat: '🐱',
  Rabbit: '🐰',
  Bird: '🐦',
  Other: '🐾',
};

export default function PetCard({ pet }) {
  return (
    <Link to={`/pets/${pet._id}`} className="pet-card">
      <div className="pet-image-wrap">
        <img
          src={pet.imageUrl || '/pet-placeholder.svg'}
          alt={`${pet.name} the ${pet.species}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/pet-placeholder.svg';
          }}
        />
        <StatusBadge status={pet.status} />
      </div>

      <div className="pet-card-body">
        <div className="pet-title-row">
          <h3>{pet.name}</h3>
          <span className="species-emoji" title={pet.species}>
            {speciesEmoji[pet.species] || '🐾'}
          </span>
        </div>
        <p className="pet-sub">
          {pet.breed} • {formatAge(pet.age)}
        </p>
        <div className="pet-meta">
          <span>📍 {pet.location}</span>
          <span>{pet.gender}</span>
        </div>
        {pet.shelter && (
          <p className="pet-shelter">🏠 {pet.shelter.shelterName || pet.shelter.name}</p>
        )}
      </div>
    </Link>
  );
}
