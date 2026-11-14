// models/AdoptionApplication.js
// An adopter submits an application for a pet.
// The shelter that owns the pet can approve or reject it.

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    adopter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    homeType: {
      type: String,
      enum: ['Apartment', 'House', 'Farm', 'Other'],
      default: 'Apartment',
    },
    hasOtherPets: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please write a short message'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewNote: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// One adopter can only have one application per pet.
applicationSchema.index({ pet: 1, adopter: 1 }, { unique: true });

module.exports = mongoose.model('AdoptionApplication', applicationSchema);
