const express = require('express');
const router = express.Router();
const { getWeightLogs, addWeightLog, deleteWeightLog } = require('../controllers/weightController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWeightLogs)
  .post(addWeightLog);

router.delete('/:id', deleteWeightLog);

module.exports = router;
