// routes/notificationRoutes.js
const express = require('express');
const {
  getNotifications,
  markAllAsRead,
  markAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
