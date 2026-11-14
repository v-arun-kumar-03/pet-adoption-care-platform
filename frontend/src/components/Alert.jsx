// src/components/Alert.jsx
// A small message box used for success and error messages.

export default function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss message">
          ×
        </button>
      )}
    </div>
  );
}
