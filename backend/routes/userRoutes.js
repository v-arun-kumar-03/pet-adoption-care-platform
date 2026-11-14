// routes/userRoutes.js
const express = require('express');
const {
  updateProfile,
  changePassword,
  uploadDocuments,
  deleteDocument,
  downloadDocument,
} = require('../controllers/userController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Verification documents are for shelters only.
router.post(
  '/documents',
  protect,
  allowRoles('shelter'),
  upload.array('documents', 3), // maximum 3 files per upload
  uploadDocuments
);

router.get('/documents/:filename', protect, downloadDocument);
router.delete('/documents/:filename', protect, allowRoles('shelter'), deleteDocument);

module.exports = router;
