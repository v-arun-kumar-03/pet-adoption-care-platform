// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'adopter',
    phone: '',
    address: '',
    shelterName: '',
    shelterDescription: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        address: form.address,
      };

      if (form.role === 'shelter') {
        payload.shelterName = form.shelterName;
        payload.shelterDescription = form.shelterDescription;
      }

      const user = await register(payload);

      // New shelters go to the dashboard where they can upload documents.
      if (user.role === 'shelter') {
        navigate('/shelter');
      } else {
        navigate('/pets');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <div className="auth-layout register-layout">
        <div className="auth-side">
          <span className="pill">Join PawHaven</span>
          <h1>One account, a whole lot of love.</h1>
          <p>
            Choose adopter if you are looking for a pet. Choose shelter if you represent a rescue
            group or shelter.
          </p>

          <div className="info-stack">
            <div className="info-item">
              <span>🏠</span>
              <div>
                <strong>Adopters</strong>
                <p>Browse pets and submit adoption applications.</p>
              </div>
            </div>
            <div className="info-item">
              <span>🏥</span>
              <div>
                <strong>Shelters</strong>
                <p>Upload verification documents, add pets and manage applications.</p>
              </div>
            </div>
            <div className="info-item">
              <span>🔒</span>
              <div>
                <strong>Private documents</strong>
                <p>Verification files are visible only to you and the admin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card card">
          <h2>Create an account</h2>
          <p className="muted">It only takes a minute.</p>

          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>

          <form onSubmit={handleSubmit} className="form">
            <div className="role-choice" role="group" aria-label="Choose account type">
              <button
                type="button"
                className={`role-option ${form.role === 'adopter' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'adopter' })}
              >
                <span>🏠</span>
                <strong>Adopter</strong>
                <small>I want to adopt a pet</small>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'shelter' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'shelter' })}
              >
                <span>🏥</span>
                <strong>Shelter</strong>
                <small>I list pets for adoption</small>
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Type it again"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="City / area"
                />
              </div>
            </div>

            {form.role === 'shelter' && (
              <div className="form-section">
                <h3>Shelter details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="shelterName">Shelter name</label>
                    <input
                      id="shelterName"
                      name="shelterName"
                      value={form.shelterName}
                      onChange={handleChange}
                      placeholder="e.g. Sunny Side Shelter"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shelterDescription">Short description</label>
                    <input
                      id="shelterDescription"
                      name="shelterDescription"
                      value={form.shelterDescription}
                      onChange={handleChange}
                      placeholder="What kind of pets do you help?"
                    />
                  </div>
                </div>
                <p className="form-hint">
                  After registering you will upload verification documents for admin review.
                </p>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
