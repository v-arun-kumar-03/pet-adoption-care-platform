// utils/validators.js
// Small reusable validation helpers for the beginner-friendly API.

function isValidEmail(email) {
  // A simple email pattern. This is enough for a college project.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeRegex(text) {
  // Search text is put inside a MongoDB regex. Escaping special characters
  // stops strange input like "(" from breaking the search.
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = { isValidEmail, escapeRegex, createError };
