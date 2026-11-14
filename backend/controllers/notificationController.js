// controllers/notificationController.js
// In-app notifications for the logged-in user.

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/validators');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ notifications, unreadCount });
});

// PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read.' });
});

// PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw createError(404, 'Notification not found.');

  res.json({ message: 'Notification marked as read.', notification });
});

module.exports = { getNotifications, markAllAsRead, markAsRead };
