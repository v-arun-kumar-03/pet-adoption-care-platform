// middleware/errorMiddleware.js
// All routes use these two middlewares at the end of app.js.
// This keeps error messages in one place.

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong on the server.';

  // Mongoose could not find a document with that id.
  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'The requested item was not found.';
  }

  // MongoDB duplicate key error (for example, an email already exists).
  if (error.code === 11000) {
    statusCode = 400;
    message = 'A record with that value already exists.';
  }

  // Errors thrown by multer during file uploads.
  if (error.name === 'MulterError') {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. The maximum size is 5 MB.'
        : `Upload error: ${error.message}`;
  }

  // Errors from jsonwebtoken.
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid login token. Please log in again.';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your login has expired. Please log in again.';
  }

  // Log the error on the server so the developer can see what happened.
  if (process.env.NODE_ENV !== 'test') {
    console.error(error.stack || error);
  }

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
