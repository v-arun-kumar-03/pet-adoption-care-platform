// controllers/applicationController.js
// Adoption applications: submit, list, approve and reject.

const AdoptionApplication = require('../models/AdoptionApplication');
const Pet = require('../models/Pet');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');

// POST /api/applications  (adopter only)
const createApplication = asyncHandler(async (req, res) => {
  const {
    petId,
    phone,
    address,
    homeType,
    hasOtherPets,
    experience,
    message,
  } = req.body;

  if (!petId) throw createError(400, 'Please choose a pet.');
  if (!phone || phone.trim().length < 6) throw createError(400, 'Please enter a valid phone number.');
  if (!address || address.trim().length < 5) throw createError(400, 'Please enter your address.');
  if (!message || message.trim().length < 10) {
    throw createError(400, 'Please write a short message (at least 10 characters).');
  }

  const pet = await Pet.findById(petId);
  if (!pet) throw createError(404, 'Pet not found.');

  if (pet.status !== 'available') {
    throw createError(400, 'This pet is no longer available for adoption.');
  }

  // Do not allow more than one application from the same person for the same pet.
  // A unique index on pet + adopter also protects against two simultaneous requests.
  const existingApplication = await AdoptionApplication.findOne({
    pet: pet._id,
    adopter: req.user._id,
  });

  if (existingApplication) {
    throw createError(400, 'You have already applied for this pet.');
  }

  const application = await AdoptionApplication.create({
    pet: pet._id,
    adopter: req.user._id,
    shelter: pet.shelter,
    phone: phone.trim(),
    address: address.trim(),
    homeType: homeType || 'Apartment',
    hasOtherPets: hasOtherPets === 'Yes' ? 'Yes' : 'No',
    experience: experience || '',
    message: message.trim(),
  });

  // Tell the shelter that a new application arrived.
  await Notification.create({
    user: pet.shelter,
    title: 'New adoption application',
    message: `${req.user.name} applied to adopt ${pet.name}.`,
    type: 'application',
  });

  res.status(201).json({ message: 'Application submitted successfully.', application });
});

// GET /api/applications/mine  (adopter)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await AdoptionApplication.find({ adopter: req.user._id })
    .populate('pet', 'name species imageUrl status')
    .populate('shelter', 'name shelterName email')
    .sort({ createdAt: -1 });

  res.json({ count: applications.length, applications });
});

// GET /api/applications/shelter  (shelter sees applications for their pets)
const getShelterApplications = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { shelter: req.user._id };

  const applications = await AdoptionApplication.find(filter)
    .populate('pet', 'name species imageUrl status')
    .populate('adopter', 'name email phone address')
    .populate('shelter', 'name shelterName')
    .sort({ createdAt: -1 });

  res.json({ count: applications.length, applications });
});

// Helper: load an application and check that this user may review it.
async function getReviewableApplication(req, res) {
  const application = await AdoptionApplication.findById(req.params.id)
    .populate('pet', 'name shelter status imageUrl')
    .populate('adopter', 'name email');

  if (!application) {
    throw createError(404, 'Application not found.');
  }

  const ownsPet = application.shelter.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !ownsPet) {
    throw createError(403, 'You can only review applications for your own pets.');
  }

  if (application.status !== 'pending') {
    throw createError(400, `This application was already ${application.status}.`);
  }

  return application;
}

// PUT /api/applications/:id/approve
const approveApplication = asyncHandler(async (req, res) => {
  const application = await getReviewableApplication(req, res);

  // IMPORTANT PART: claim the pet with ONE conditional database update.
  // Only an "available" pet can be adopted. If two shelter staff click
  // approve at the same time, only the first update succeeds.
  const claimedPet = await Pet.findOneAndUpdate(
    { _id: application.pet._id, status: 'available' },
    { status: 'adopted' },
    { new: true }
  );

  if (!claimedPet) {
    throw createError(
      400,
      'This pet has already been adopted or is no longer available. The application cannot be approved.'
    );
  }

  application.status = 'approved';
  application.reviewedAt = new Date();
  application.reviewNote = req.body.reviewNote || 'Congratulations! Your application was approved.';
  await application.save();

  // Close the other pending applications for this pet.
  await AdoptionApplication.updateMany(
    {
      pet: application.pet._id,
      _id: { $ne: application._id },
      status: 'pending',
    },
    {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewNote: 'Another application was approved for this pet.',
    }
  );

  // Notify the adopter.
  await Notification.create({
    user: application.adopter._id,
    title: 'Adoption approved',
    message: `Great news! Your application to adopt ${application.pet.name} was approved.`,
    type: 'adoption',
  });

  res.json({ message: 'Application approved and pet marked as adopted.', application });
});

// PUT /api/applications/:id/reject
const rejectApplication = asyncHandler(async (req, res) => {
  const application = await getReviewableApplication(req, res);

  application.status = 'rejected';
  application.reviewedAt = new Date();
  application.reviewNote = req.body.reviewNote || 'The shelter did not approve this application.';
  await application.save();

  await Notification.create({
    user: application.adopter._id,
    title: 'Application update',
    message: `Your application to adopt ${application.pet.name} was not approved.`,
    type: 'adoption',
  });

  res.json({ message: 'Application rejected.', application });
});

module.exports = {
  createApplication,
  getMyApplications,
  getShelterApplications,
  approveApplication,
  rejectApplication,
};
