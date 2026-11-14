// controllers/dashboardController.js
// Returns simple numbers for the dashboard of the logged-in user.
// Each role sees different information.

const User = require('../models/User');
const Pet = require('../models/Pet');
const AdoptionApplication = require('../models/AdoptionApplication');
const CareReminder = require('../models/CareReminder');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const unreadNotifications = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  // -------------------- ADMIN DASHBOARD --------------------
  if (req.user.role === 'admin') {
    const [
      totalUsers,
      totalShelters,
      pendingShelters,
      totalPets,
      availablePets,
      adoptedPets,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'shelter' }),
      User.countDocuments({ role: 'shelter', verificationStatus: 'pending' }),
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'available' }),
      Pet.countDocuments({ status: 'adopted' }),
      AdoptionApplication.countDocuments(),
      AdoptionApplication.countDocuments({ status: 'pending' }),
    ]);

    const recentApplications = await AdoptionApplication.find()
      .populate('pet', 'name species imageUrl')
      .populate('adopter', 'name email')
      .populate('shelter', 'name shelterName')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      role: req.user.role,
      stats: {
        totalUsers,
        totalShelters,
        pendingShelters,
        totalPets,
        availablePets,
        adoptedPets,
        totalApplications,
        pendingApplications,
        unreadNotifications,
      },
      recentApplications,
    });
  }

  // -------------------- SHELTER DASHBOARD --------------------
  if (req.user.role === 'shelter') {
    const petIds = await Pet.find({ shelter: req.user._id }).distinct('_id');

    const [
      totalPets,
      availablePets,
      adoptedPets,
      pendingApplications,
      approvedApplications,
      upcomingReminders,
    ] = await Promise.all([
      Pet.countDocuments({ shelter: req.user._id }),
      Pet.countDocuments({ shelter: req.user._id, status: 'available' }),
      Pet.countDocuments({ shelter: req.user._id, status: 'adopted' }),
      AdoptionApplication.countDocuments({
        shelter: req.user._id,
        status: 'pending',
      }),
      AdoptionApplication.countDocuments({
        shelter: req.user._id,
        status: 'approved',
      }),
      CareReminder.find({
        shelter: req.user._id,
        isDone: false,
        pet: { $in: petIds },
      })
        .populate('pet', 'name')
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    const recentApplications = await AdoptionApplication.find({ shelter: req.user._id })
      .populate('pet', 'name species imageUrl')
      .populate('adopter', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      role: req.user.role,
      stats: {
        totalPets,
        availablePets,
        adoptedPets,
        pendingApplications,
        approvedApplications,
        verificationStatus: req.user.verificationStatus,
        unreadNotifications,
      },
      recentApplications,
      upcomingReminders,
    });
  }

  // -------------------- ADOPTER DASHBOARD --------------------
  const [totalApplications, pendingApplications, approvedApplications, rejectedApplications, availablePets] =
    await Promise.all([
      AdoptionApplication.countDocuments({ adopter: req.user._id }),
      AdoptionApplication.countDocuments({ adopter: req.user._id, status: 'pending' }),
      AdoptionApplication.countDocuments({ adopter: req.user._id, status: 'approved' }),
      AdoptionApplication.countDocuments({ adopter: req.user._id, status: 'rejected' }),
      Pet.countDocuments({ status: 'available' }),
    ]);

  const recentApplications = await AdoptionApplication.find({ adopter: req.user._id })
    .populate('pet', 'name species imageUrl status')
    .populate('shelter', 'name shelterName')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    role: req.user.role,
    stats: {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      availablePets,
      unreadNotifications,
    },
    recentApplications,
    upcomingReminders: [],
  });
});

module.exports = { getDashboard };
