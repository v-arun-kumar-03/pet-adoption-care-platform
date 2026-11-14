// routes/petRoutes.js
const express = require('express');
const {
  getPets,
  getMyPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require('../controllers/petController');
const { getRecords, addRecord } = require('../controllers/medicalRecordController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getPets);

// This route must come before "/:id" so "mine" is not treated as an id.
router.get('/mine', protect, allowRoles('shelter', 'admin'), getMyPets);

// Medical records (logged-in users can read, shelter owner can add)
router.get('/:petId/records', protect, getRecords);
router.post('/:petId/records', protect, allowRoles('shelter', 'admin'), addRecord);

// Pet details
router.get('/:id', getPetById);

// Protected pet management
router.post('/', protect, allowRoles('shelter', 'admin'), createPet);
router.put('/:id', protect, allowRoles('shelter', 'admin'), updatePet);
router.delete('/:id', protect, allowRoles('shelter', 'admin'), deletePet);

module.exports = router;
