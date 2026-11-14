// controllers/statsController.js
// Public numbers used on the home page. No login needed.

const Pet = require('../models/Pet');
const User = require('../models/User');
const AdoptionApplication = require('../models/AdoptionApplication');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/stats
const getPublicStats = asyncHandler(async (req, res) => {
  const [availablePets, adoptedPets, shelters, successfulAdoptions] = await Promise.all([
    Pet.countDocuments({ status: 'available' }),
    Pet.countDocuments({ status: 'adopted' }),
    User.countDocuments({ role: 'shelter', verificationStatus: 'approved' }),
    AdoptionApplication.countDocuments({ status: 'approved' }),
  ]);

  res.json({ availablePets, adoptedPets, shelters, successfulAdoptions });
});

module.exports = { getPublicStats };
