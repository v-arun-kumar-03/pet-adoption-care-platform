// controllers/medicalRecordController.js
// Medical and vaccination records for a pet.

const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');

// Checks that the logged-in shelter owns this pet (admins are allowed too).
function checkPetOwnership(req, pet) {
  const isOwner = pet.shelter.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    throw createError(403, 'You can only manage medical records for your own pets.');
  }
}

// GET /api/pets/:petId/records  (logged-in users)
const getRecords = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) throw createError(404, 'Pet not found.');

  const records = await MedicalRecord.find({ pet: pet._id }).sort({ recordDate: -1 });

  res.json({ pet: { _id: pet._id, name: pet.name }, records });
});

// POST /api/pets/:petId/records  (owner shelter or admin)
const addRecord = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) throw createError(404, 'Pet not found.');

  checkPetOwnership(req, pet);

  const { type, title, description, recordDate, vetName, nextDueDate } = req.body;

  if (!title || title.trim().length < 3) {
    throw createError(400, 'Please enter a record title.');
  }

  if (!recordDate) {
    throw createError(400, 'Please choose the record date.');
  }

  const record = await MedicalRecord.create({
    pet: pet._id,
    type: type || 'Checkup',
    title: title.trim(),
    description: description || '',
    recordDate: new Date(recordDate),
    vetName: vetName || '',
    nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
  });

  res.status(201).json({ message: 'Medical record added.', record });
});

// DELETE /api/records/:recordId
const deleteRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.recordId).populate('pet', 'shelter name');

  if (!record) throw createError(404, 'Medical record not found.');
  if (!record.pet) throw createError(404, 'The pet for this record no longer exists.');

  checkPetOwnership(req, record.pet);

  await record.deleteOne();

  res.json({ message: 'Medical record deleted.' });
});

module.exports = { getRecords, addRecord, deleteRecord };
