// src/pages/Home.jsx
// Public landing page with live numbers and featured pets.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PetCard from '../components/PetCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({
    availablePets: 0,
    successfulAdoptions: 0,
    shelters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/pets', { params: { status: 'available' } }), api.get('/stats')])
      .then(([petsResponse, statsResponse]) => {
        if (!active) return;
        setPets(petsResponse.data.pets.slice(0, 3));
        setStats(statsResponse.data);
      })
      .catch(() => {
        // The page still works; it simply shows no pets if the API is offline.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const heroImage =
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80';

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="pill">🐾 Pet adoption &amp; care platform</span>
            <h1>
              Find your new best friend at <span className="text-primary">PawHaven</span>
            </h1>
            <p className="hero-lead">
              Meet rescued dogs, cats, rabbits and birds from verified shelters. Apply to adopt,
              follow the review, and keep every pet's care organised in one simple place.
            </p>

            <div className="hero-actions">
              <Link to="/pets" className="btn btn-primary">
                Meet the pets
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Join PawHaven
              </Link>
            </div>

            <div className="hero-trust">
              <div>
                <strong>{stats.availablePets}</strong>
                <span>Pets available</span>
              </div>
              <div>
                <strong>{stats.successfulAdoptions}</strong>
                <span>Successful adoptions</span>
              </div>
              <div>
                <strong>{stats.shelters}</strong>
                <span>Verified shelters</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={heroImage}
              alt="A happy pet waiting for adoption"
              onError={(event) => {
                event.currentTarget.src = '/pet-placeholder.svg';
              }}
            />
            <div className="floating-card floating-top">
              <span>❤️</span>
              <div>
                <strong>Made for matches</strong>
                <small>Every application is reviewed by the shelter</small>
              </div>
            </div>
            <div className="floating-card floating-bottom">
              <span>🏠</span>
              <div>
                <strong>Verified shelters</strong>
                <small>Documents checked by an admin</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>Three simple steps to a happy home</h2>
            <p>No complicated process. Just meet a pet, apply, and talk to the shelter.</p>
          </div>

          <div className="grid-3">
            <div className="step-card">
              <span className="step-number">1</span>
              <span className="step-icon">🔍</span>
              <h3>Browse pets</h3>
              <p>Search by species, age or location and read each pet's story and medical notes.</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <span className="step-icon">📝</span>
              <h3>Apply to adopt</h3>
              <p>Create an adopter account and send a short application to the shelter.</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <span className="step-icon">🏡</span>
              <h3>Welcome them home</h3>
              <p>The shelter reviews your application. Once approved, the pet is marked as adopted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED PETS ---------------- */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Waiting for you</p>
              <h2>Meet some of our friends</h2>
            </div>
            <Link to="/pets" className="text-link">
              View all pets →
            </Link>
          </div>

          {loading ? (
            <Loading message="Finding lovely pets..." />
          ) : pets.length > 0 ? (
            <div className="pet-grid">
              {pets.map((pet) => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pets listed yet"
              text="A shelter can add pets after logging in. Check back soon!"
            />
          )}
        </div>
      </section>

      {/* ---------------- ROLES ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">One platform, three roles</p>
            <h2>Built for adopters, shelters and admins</h2>
          </div>

          <div className="grid-3">
            <div className="role-card">
              <span className="role-icon">🏠</span>
              <h3>Adopters</h3>
              <p>Browse available pets, submit applications and track every approval in your dashboard.</p>
              <Link to="/register" className="text-link">
                Create an adopter account →
              </Link>
            </div>
            <div className="role-card">
              <span className="role-icon">🏥</span>
              <h3>Shelters</h3>
              <p>Add pets, review applications, keep medical records and set care reminders.</p>
              <Link to="/register" className="text-link">
                Register your shelter →
              </Link>
            </div>
            <div className="role-card">
              <span className="role-icon">🛡️</span>
              <h3>Admins</h3>
              <p>Verify shelter documents, see platform numbers and keep adoption activity in check.</p>
              <span className="muted small">Admin accounts are created by the project owner.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container">
        <div className="cta-banner">
          <div>
            <h2>Ready to change a little life?</h2>
            <p>Join PawHaven today. It takes less than a minute to create an account.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-light">
              Get started
            </Link>
            <Link to="/pets" className="btn btn-outline-light">
              Browse pets
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
