const express = require('express');
const router = express.Router();
const { getCalories, addCalorie, deleteCalorie } = require('../controllers/calorieController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCalories)
  .post(addCalorie);

router.delete('/:id', deleteCalorie);

module.exports = router;
