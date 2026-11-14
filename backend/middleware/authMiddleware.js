// middleware/authMiddleware.js
// Two small middlewares:
// 1. protect  -> checks the JWT and loads the logged-in user.
// 2. allowRoles -> blocks users whose role is not allowed.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not logged in. Please log in first.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user so controllers can use req.user.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    // Invalid/expired token errors are handled by the central error handler.
    next(error);
  }
}

function allowRoles(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not logged in.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }

    next();
  };
}

module.exports = { protect, allowRoles };
