// utils/generateToken.js
// Creates a JWT (JSON Web Token) after registration or login.
// The frontend sends this token back in the Authorization header.

const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
