// models/Pet.js
// A Pet belongs to one shelter (ObjectId reference).
// status is either "available" or "adopted".

const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      enum: ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'],
      required: [true, 'Species is required'],
    },
    breed: { type: String, default: 'Mixed', trim: true },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      default: 1,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      default: 'Male',
    },
    size: {
      type: String,
      enum: ['Small', 'Medium', 'Large'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    imageUrl: { type: String, default: '' },
    location: { type: String, default: 'Unknown' },
    vaccinated: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['available', 'adopted'],
      default: 'available',
    },
    // This is the link to the shelter user who owns the pet.
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for the filters used on the Browse Pets page.
petSchema.index({ status: 1, species: 1 });
petSchema.index({ location: 1 });

module.exports = mongoose.model('Pet', petSchema);
