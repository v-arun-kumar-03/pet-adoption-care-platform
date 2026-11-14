// routes/reminderRoutes.js
const express = require('express');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, allowRoles('shelter', 'admin'));

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
