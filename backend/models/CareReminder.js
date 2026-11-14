// models/CareReminder.js
// Shelters can create simple care reminders for their pets.
// A small background checker (utils/reminderChecker.js) sends a notification
// when a reminder becomes due.

const mongoose = require('mongoose');

const careReminderSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
    },
    notes: { type: String, default: '', trim: true },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    isDone: { type: Boolean, default: false },
    // notified prevents the same reminder from creating many notifications.
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareReminder', careReminderSchema);
