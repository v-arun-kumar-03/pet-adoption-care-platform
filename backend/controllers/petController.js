// controllers/petController.js
// Simple CRUD operations for pets, plus search and filtering.

const Pet = require('../models/Pet');
const User = require('../models/User');
const AdoptionApplication = require('../models/AdoptionApplication');
const MedicalRecord = require('../models/MedicalRecord');
const CareReminder = require('../models/CareReminder');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, createError } = require('../utils/validators');

// Fields a shelter is allowed to set when creating/updating a pet.
function pickPetFields(body) {
  return {
    name: body.name,
    species: body.species,
    breed: body.breed,
    age: body.age,
    gender: body.gender,
    size: body.size,
    description: body.description,
    imageUrl: body.imageUrl,
    location: body.location,
    vaccinated: body.vaccinated,
    status: body.status,
  };
}

// GET /api/pets
// Supports: ?search=&species=&status=&location=&maxAge=
const getPets = asyncHandler(async (req, res) => {
  const { search, species, status, location, maxAge } = req.query;
  const filter = {};

  if (search && search.trim()) {
    const text = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: text, $options: 'i' } },
      { breed: { $regex: text, $options: 'i' } },
      { description: { $regex: text, $options: 'i' } },
    ];
  }

  if (species) filter.species = species;
  if (status) filter.status = status;

  if (location && location.trim()) {
    filter.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
  }

  if (maxAge && !Number.isNaN(Number(maxAge))) {
    filter.age = { $lte: Number(maxAge) };
  }

  const pets = await Pet.find(filter)
    .populate('shelter', 'name shelterName email location')
    .sort({ createdAt: -1 });

  res.json({ count: pets.length, pets });
});

// GET /api/pets/mine
// Returns only the logged-in shelter's pets.
const getMyPets = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { shelter: req.user._id };

  const pets = await Pet.find(filter).sort({ createdAt: -1 });

  res.json({ count: pets.length, pets });
});

// GET /api/pets/:id
const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate(
    'shelter',
    'name shelterName email phone address location verificationStatus'
  );

  if (!pet) {
    throw createError(404, 'Pet not found.');
  }

  res.json({ pet });
});

// POST /api/pets  (shelter or admin)
const createPet = asyncHandler(async (req, res) => {
  // A shelter must be verified by an admin before adding pets.
  if (req.user.role === 'shelter' && req.user.verificationStatus !== 'approved') {
    throw createError(
      403,
      'Your shelter is not verified yet. Please upload verification documents and wait for admin approval.'
    );
  }

  const data = pickPetFields(req.body);

  if (!data.name || !data.name.trim()) {
    throw createError(400, 'Pet name is required.');
  }

  if (!data.species) {
    throw createError(400, 'Please select a species.');
  }

  if (!data.description || data.description.trim().length < 10) {
    throw createError(400, 'Please write a description of at least 10 characters.');
  }

  // Shelters always own their own pets. If an admin creates a pet,
  // the request must include a shelter id.
  let shelterId = req.user._id;

  if (req.user.role === 'admin') {
    shelterId = req.body.shelter;
    const shelter = await User.findOne({ _id: shelterId, role: 'shelter' });
    if (!shelter) {
      throw createError(400, 'Please provide a valid shelter id.');
    }
  }

  const pet = await Pet.create({
    name: data.name.trim(),
    species: data.species,
    breed: data.breed || 'Mixed',
    age: data.age || 0,
    gender: data.gender || 'Male',
    size: data.size || 'Medium',
    description: data.description.trim(),
    imageUrl: data.imageUrl || '',
    location: data.location || req.user.address || 'Unknown',
    vaccinated: Boolean(data.vaccinated),
    status: data.status === 'adopted' ? 'adopted' : 'available',
    shelter: shelterId,
  });

  res.status(201).json({ message: 'Pet added successfully.', pet });
});

// PUT /api/pets/:id  (owner shelter or admin)
const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    throw createError(404, 'Pet not found.');
  }

  const isOwner = pet.shelter.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    throw createError(403, 'You can only edit pets that belong to your shelter.');
  }

  const data = pickPetFields(req.body);

  if (data.name !== undefined) {
    if (!data.name.trim()) throw createError(400, 'Pet name cannot be empty.');
    pet.name = data.name.trim();
  }

  if (data.description !== undefined) {
    if (data.description.trim().length < 10) {
      throw createError(400, 'Description must be at least 10 characters.');
    }
    pet.description = data.description.trim();
  }

  if (data.species !== undefined) pet.species = data.species;
  if (data.breed !== undefined) pet.breed = data.breed || 'Mixed';
  if (data.age !== undefined) pet.age = Number(data.age) || 0;
  if (data.gender !== undefined) pet.gender = data.gender;
  if (data.size !== undefined) pet.size = data.size;
  if (data.imageUrl !== undefined) pet.imageUrl = data.imageUrl;
  if (data.location !== undefined) pet.location = data.location;
  if (data.vaccinated !== undefined) pet.vaccinated = Boolean(data.vaccinated);

  if (data.status !== undefined) {
    pet.status = data.status === 'adopted' ? 'adopted' : 'available';

    // If a pet is marked adopted manually, close other pending applications
    // so they do not stay "pending" forever.
    if (pet.status === 'adopted') {
      await AdoptionApplication.updateMany(
        { pet: pet._id, status: 'pending' },
        { status: 'rejected', reviewNote: 'Pet was marked as adopted by the shelter.' }
      );
    }
  }

  await pet.save();

  res.json({ message: 'Pet updated successfully.', pet });
});

// DELETE /api/pets/:id  (owner shelter or admin)
// Related records are removed with simple deleteMany calls.
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    throw createError(404, 'Pet not found.');
  }

  const isOwner = pet.shelter.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    throw createError(403, 'You can only delete pets that belong to your shelter.');
  }

  await Promise.all([
    MedicalRecord.deleteMany({ pet: pet._id }),
    CareReminder.deleteMany({ pet: pet._id }),
    AdoptionApplication.deleteMany({ pet: pet._id }),
    Pet.deleteOne({ _id: pet._id }),
  ]);

  res.json({ message: 'Pet and related records deleted.' });
});

module.exports = {
  getPets,
  getMyPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};
