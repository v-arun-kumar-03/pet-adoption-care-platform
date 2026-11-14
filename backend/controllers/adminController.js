// controllers/adminController.js
// Admin-only actions: viewing users and verifying shelters.

const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');

// GET /api/admin/users?role=shelter
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.json({ count: users.length, users });
});

// GET /api/admin/shelters
// Shelters with pending documents are listed first.
const getShelters = asyncHandler(async (req, res) => {
  const shelters = await User.find({ role: 'shelter' }).sort({ createdAt: -1 });

  // A simple sort in JavaScript keeps the database query easy to read.
  const priority = { pending: 0, rejected: 1, not_submitted: 2, approved: 3 };
  shelters.sort((a, b) => priority[a.verificationStatus] - priority[b.verificationStatus]);

  res.json({ count: shelters.length, shelters });
});

// PUT /api/admin/shelters/:id/verify
// body: { status: "approved" | "rejected", note: "..." }
const verifyShelter = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw createError(400, 'Status must be approved or rejected.');
  }

  const shelter = await User.findOne({ _id: req.params.id, role: 'shelter' });

  if (!shelter) throw createError(404, 'Shelter not found.');

  if (status === 'approved' && shelter.documents.length === 0) {
    throw createError(400, 'This shelter has not uploaded any documents yet.');
  }

  shelter.verificationStatus = status;
  shelter.verificationNote =
    note || (status === 'approved' ? 'Your shelter has been verified.' : 'Documents were not accepted.');
  await shelter.save();

  // Notify the shelter about the decision.
  await Notification.create({
    user: shelter._id,
    title: status === 'approved' ? 'Shelter verified' : 'Verification rejected',
    message:
      status === 'approved'
        ? 'Your shelter is verified. You can now add pets for adoption.'
        : `Your verification was rejected. ${shelter.verificationNote}`,
    type: 'verification',
  });

  res.json({ message: `Shelter ${status}.`, shelter });
});

module.exports = { getUsers, getShelters, verifyShelter };
