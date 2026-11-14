// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import Alert from '../components/Alert';

const demoAccounts = [
  { label: 'Adopter', email: 'adopter@example.com', password: 'Adopter@123' },
  { label: 'Shelter', email: 'shelter@sunnyside.com', password: 'Shelter@123' },
  { label: 'Admin', email: 'admin@pawhaven.com', password: 'Admin@123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function fillDemo(account) {
    setForm({ email: account.email, password: account.password });
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password);

      // Return to the page the user originally wanted, if any.
      if (location.state && location.state.from) {
        navigate(location.state.from);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'shelter') {
        navigate('/shelter');
      } else {
        navigate('/adopter');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <div className="auth-layout">
        <div className="auth-side">
          <span className="pill">Welcome back</span>
          <h1>Good to see you at PawHaven.</h1>
          <p>
            Log in to track applications, manage your shelter, or verify documents from the admin
            panel.
          </p>

          <div className="demo-box">
            <h3>Try a demo account</h3>
            <p className="muted small">Click a role to fill the login form.</p>
            <div className="demo-buttons">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  className="demo-button"
                  onClick={() => fillDemo(account)}
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="demo-note">
              Demo passwords use the same pattern as the project seed file.
            </p>
          </div>
        </div>

        <div className="auth-card card">
          <h2>Login</h2>
          <p className="muted">Enter the email and password you registered with.</p>

          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
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
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            New to PawHaven? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
