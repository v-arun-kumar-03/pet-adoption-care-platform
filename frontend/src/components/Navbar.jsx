// src/components/Navbar.jsx
// Responsive navigation bar. Links change based on the user's role.

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🐾</span>
          <span>
            Paw<span className="brand-accent">Haven</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/pets" className={linkClass}>
              Browse Pets
            </NavLink>

            {user && user.role === 'adopter' && (
              <NavLink to="/adopter" className={linkClass}>
                My Applications
              </NavLink>
            )}

            {user && user.role === 'shelter' && (
              <>
                <NavLink to="/shelter" className={linkClass} end>
                  Dashboard
                </NavLink>
                <NavLink to="/shelter/pets" className={linkClass}>
                  My Pets
                </NavLink>
                <NavLink to="/shelter/applications" className={linkClass}>
                  Applications
                </NavLink>
                <NavLink to="/shelter/reminders" className={linkClass}>
                  Reminders
                </NavLink>
              </>
            )}

            {user && user.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>
                Admin Panel
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <NavLink to="/notifications" className="nav-icon-link" title="Notifications">
                  <span aria-hidden="true">🔔</span>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  <span className="sr-only">Notifications</span>
                </NavLink>

                <NavLink to="/profile" className="nav-user">
                  <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                </NavLink>

                <button type="button" className="btn btn-outline btn-small" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-small">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
