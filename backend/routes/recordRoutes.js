// routes/recordRoutes.js
const express = require('express');
const { deleteRecord } = require('../controllers/medicalRecordController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.delete('/:recordId', protect, allowRoles('shelter', 'admin'), deleteRecord);

module.exports = router;
