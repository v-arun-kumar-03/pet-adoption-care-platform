// utils/asyncHandler.js
// A tiny helper that catches errors inside async controllers and passes them
// to Express's error handler. This avoids writing try/catch in every function.

function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
