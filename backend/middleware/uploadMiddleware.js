// middleware/uploadMiddleware.js
// Multer saves verification documents in a PRIVATE folder.
// They are not served as static files. A protected route in
// userController.js checks who is allowed to open them.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolder = path.join(__dirname, '..', 'uploads', 'verification');

// Make sure the folder exists before multer tries to write to it.
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadFolder);
  },
  filename(req, file, cb) {
    // Keep only safe characters in the filename to avoid path problems.
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${req.user.id}-${Date.now()}-${safeName}`);
  },
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function fileFilter(req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only JPG, PNG, WEBP images and PDF files are allowed.');
    error.statusCode = 400;
    cb(error);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

module.exports = { upload, uploadFolder };
