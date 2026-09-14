const express = require('express');
const router = express.Router();
const { getDashboardStats, getProgressStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/progress', getProgressStats);

module.exports = router;
