// src/utils/format.js
// Small formatting helpers used by many pages.

export function formatDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatAge(years) {
  const age = Number(years);

  if (!age || age < 1) return 'Less than 1 year';
  if (age === 1) return '1 year';
  return `${age} years`;
}

export function isOverdue(dateValue) {
  if (!dateValue) return false;
  return new Date(dateValue) < new Date() && new Date(dateValue).toDateString() !== new Date().toDateString();
}

export function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!size || size < 1) return '0 KB';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function roleLabel(role) {
  if (role === 'shelter') return 'Shelter';
  if (role === 'admin') return 'Admin';
  return 'Adopter';
}
