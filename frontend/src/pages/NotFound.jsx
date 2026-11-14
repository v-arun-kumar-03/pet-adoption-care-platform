// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <span className="empty-icon">🐾</span>
        <h1>404 — Page not found</h1>
        <p>This little path does not lead anywhere. Let us take you home.</p>
        <div className="empty-actions">
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link to="/pets" className="btn btn-outline">
            Browse pets
          </Link>
        </div>
      </div>
    </div>
  );
}
