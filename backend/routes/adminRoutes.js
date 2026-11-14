// routes/adminRoutes.js
const express = require('express');
const { getUsers, getShelters, verifyShelter } = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Every route in this file requires an admin login.
router.use(protect, allowRoles('admin'));

router.get('/users', getUsers);
router.get('/shelters', getShelters);
router.put('/shelters/:id/verify', verifyShelter);

module.exports = router;
