// controllers/reminderController.js
// Simple care reminders for shelters.

const CareReminder = require('../models/CareReminder');
const Pet = require('../models/Pet');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');

// GET /api/reminders  (shelter's own reminders)
const getReminders = asyncHandler(async (req, res) => {
  const reminders = await CareReminder.find({ shelter: req.user._id })
    .populate('pet', 'name species imageUrl')
    .sort({ dueDate: 1 });

  res.json({ count: reminders.length, reminders });
});

// POST /api/reminders
const createReminder = asyncHandler(async (req, res) => {
  const { petId, title, notes, dueDate } = req.body;

  if (!petId) throw createError(400, 'Please choose a pet.');
  if (!title || title.trim().length < 3) throw createError(400, 'Please enter a reminder title.');
  if (!dueDate) throw createError(400, 'Please choose a due date.');

  const pet = await Pet.findById(petId);
  if (!pet) throw createError(404, 'Pet not found.');

  if (pet.shelter.toString() !== req.user._id.toString()) {
    throw createError(403, 'You can only create reminders for your own pets.');
  }

  const reminder = await CareReminder.create({
    pet: pet._id,
    shelter: req.user._id,
    title: title.trim(),
    notes: notes || '',
    dueDate: new Date(dueDate),
  });

  res.status(201).json({ message: 'Reminder created.', reminder });
});

// PUT /api/reminders/:id
// The frontend mainly uses this to mark a reminder as done/not done.
const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await CareReminder.findOne({
    _id: req.params.id,
    shelter: req.user._id,
  });

  if (!reminder) throw createError(404, 'Reminder not found.');

  const { title, notes, dueDate, isDone } = req.body;

  if (title !== undefined) reminder.title = title.trim();
  if (notes !== undefined) reminder.notes = notes;
  if (dueDate !== undefined) reminder.dueDate = new Date(dueDate);

  if (isDone !== undefined) {
    reminder.isDone = Boolean(isDone);
    // When a reminder is re-opened, allow it to notify again.
    if (!reminder.isDone) reminder.notified = false;
  }

  await reminder.save();

  res.json({ message: 'Reminder updated.', reminder });
});

// DELETE /api/reminders/:id
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await CareReminder.findOneAndDelete({
    _id: req.params.id,
    shelter: req.user._id,
  });

  if (!reminder) throw createError(404, 'Reminder not found.');

  res.json({ message: 'Reminder deleted.' });
});

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
