// controllers/userController.js
// Profile updates and private verification document handling.

const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');
const { uploadFolder } = require('../middleware/uploadMiddleware');

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, shelterName, shelterDescription } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) throw createError(404, 'User not found.');

  if (name !== undefined) {
    if (!name.trim() || name.trim().length < 2) {
      throw createError(400, 'Name must be at least 2 characters.');
    }
    user.name = name.trim();
  }

  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  if (user.role === 'shelter') {
    if (shelterName !== undefined) {
      if (!shelterName.trim()) throw createError(400, 'Shelter name cannot be empty.');
      user.shelterName = shelterName.trim();
    }
    if (shelterDescription !== undefined) user.shelterDescription = shelterDescription;
  }

  await user.save();

  res.json({ message: 'Profile updated.', user });
});

// PUT /api/users/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError(400, 'Please enter your current and new password.');
  }

  if (newPassword.length < 6) {
    throw createError(400, 'The new password must be at least 6 characters.');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    throw createError(400, 'Your current password is incorrect.');
  }

  user.password = newPassword;
  await user.save(); // the User model hashes it automatically

  res.json({ message: 'Password changed successfully.' });
});

// POST /api/users/documents  (shelter only)
// Multer has already saved the files when this controller runs.
const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw createError(400, 'Please choose at least one document.');
  }

  const user = await User.findById(req.user._id);

  req.files.forEach((file) => {
    user.documents.push({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  });

  // Uploading sends the shelter back to "pending" unless they were
  // already approved (approved shelters may add extra documents).
  if (user.verificationStatus !== 'approved') {
    user.verificationStatus = 'pending';
  }
  user.verificationNote = '';

  await user.save();

  // Tell all admins that documents are waiting for review.
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (admins.length > 0) {
    await Notification.insertMany(
      admins.map((admin) => ({
        user: admin._id,
        title: 'New verification documents',
        message: `${user.shelterName || user.name} uploaded verification documents.`,
        type: 'verification',
      }))
    );
  }

  res.status(201).json({
    message: 'Documents uploaded. An admin will review them soon.',
    user,
  });
});

// DELETE /api/users/documents/:filename
const deleteDocument = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const filename = path.basename(req.params.filename);
  const document = user.documents.find((doc) => doc.filename === filename);

  if (!document) throw createError(404, 'Document not found.');

  // Remove the file from disk. If it is already missing, continue anyway.
  const filePath = path.join(uploadFolder, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  user.documents = user.documents.filter((doc) => doc.filename !== filename);

  if (user.documents.length === 0 && user.verificationStatus === 'pending') {
    user.verificationStatus = 'not_submitted';
  }

  await user.save();

  res.json({ message: 'Document removed.', user });
});

// GET /api/users/documents/:filename
// The file is only returned to its owner or an admin.
const downloadDocument = asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename);
  const user = await User.findOne({ 'documents.filename': filename });

  if (!user) throw createError(404, 'Document not found.');

  const isOwner = user._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    throw createError(403, 'You are not allowed to open this document.');
  }

  const document = user.documents.find((doc) => doc.filename === filename);
  const filePath = path.join(uploadFolder, filename);

  if (!fs.existsSync(filePath)) {
    throw createError(404, 'The file is missing from the server.');
  }

  res.download(filePath, document ? document.originalName : filename);
});

module.exports = {
  updateProfile,
  changePassword,
  uploadDocuments,
  deleteDocument,
  downloadDocument,
};
