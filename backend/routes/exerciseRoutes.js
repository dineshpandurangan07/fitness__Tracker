const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getExercises)
  .post(protect, createExercise);

router.route('/:id')
  .get(getExerciseById)
  .put(protect, updateExercise)
  .delete(protect, deleteExercise);

module.exports = router;
