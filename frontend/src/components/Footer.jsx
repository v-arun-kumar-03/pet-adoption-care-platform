// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">🐾</span>
            <span>
              Paw<span className="brand-accent">Haven</span>
            </span>
          </Link>
          <p className="footer-text">
            A simple pet adoption and care platform built as a MERN stack college project.
            Every pet deserves a loving home.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/pets">Browse pets</Link>
          <Link to="/register">Create an account</Link>
          <Link to="/login">Login</Link>
        </div>

        <div>
          <h3>Project</h3>
          <p className="footer-text small">
            React + Vite frontend
            <br />
            Express + MongoDB backend
            <br />
            JWT authentication with 3 roles
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PawHaven. College mini-project.</span>
        <span>Made with care for pets and their people.</span>
      </div>
    </footer>
  );
}
