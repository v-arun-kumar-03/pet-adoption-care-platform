// models/MedicalRecord.js
// One simple model stores checkups, vaccinations, treatments, etc.
// Vaccinations are records with type = "Vaccination" and can have a nextDueDate.

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    type: {
      type: String,
      enum: ['Checkup', 'Vaccination', 'Treatment', 'Surgery', 'Other'],
      default: 'Checkup',
    },
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },
    description: { type: String, default: '', trim: true },
    recordDate: {
      type: Date,
      required: [true, 'Record date is required'],
    },
    vetName: { type: String, default: '', trim: true },
    nextDueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
