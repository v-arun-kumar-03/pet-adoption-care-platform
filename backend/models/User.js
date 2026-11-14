// models/User.js
// A User can be an admin, a shelter, or an adopter.
// The role field is used by the auth middleware to protect routes.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Verification documents are stored as small pieces of information.
// The actual files live in the private uploads/verification folder.
const documentSchema = new mongoose.Schema(
  {
    filename: String, // name of the file on the server
    originalName: String, // name the user uploaded
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // do not return the password by default
    },
    role: {
      type: String,
      enum: ['admin', 'shelter', 'adopter'],
      default: 'adopter',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },

    // Shelter-only information
    shelterName: { type: String, default: '' },
    shelterDescription: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted',
    },
    verificationNote: { type: String, default: '' },
    documents: [documentSchema],
  },
  { timestamps: true }
);

// Before saving a user, hash the password with bcryptjs.
// We only do this when the password field was changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper used during login to compare the typed password with the hash.
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove the password hash whenever a user document is converted to JSON.
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
