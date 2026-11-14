// routes/applicationRoutes.js
const express = require('express');
const {
  createApplication,
  getMyApplications,
  getShelterApplications,
  approveApplication,
  rejectApplication,
} = require('../controllers/applicationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Adopter routes
router.post('/', protect, allowRoles('adopter'), createApplication);
router.get('/mine', protect, allowRoles('adopter'), getMyApplications);

// Shelter routes
router.get('/shelter', protect, allowRoles('shelter', 'admin'), getShelterApplications);
router.put('/:id/approve', protect, allowRoles('shelter', 'admin'), approveApplication);
router.put('/:id/reject', protect, allowRoles('shelter', 'admin'), rejectApplication);

module.exports = router;
