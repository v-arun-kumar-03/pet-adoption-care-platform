// src/components/Loading.jsx
export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading">
      <span className="spinner" aria-hidden="true"></span>
      <p>{message}</p>
    </div>
  );
}
