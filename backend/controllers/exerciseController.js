const Exercise = require('../models/Exercise');

// @desc    Get all exercises with search & filters
// @route   GET /api/exercises
// @access  Public or Private
const getExercises = async (req, res, next) => {
  try {
    const { muscleGroup, difficulty, equipment, search } = req.query;
    let query = {};

    if (muscleGroup && muscleGroup !== 'All') {
      query.muscleGroup = muscleGroup;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (equipment && equipment !== 'All') {
      query.equipment = { $regex: equipment, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const exercises = await Exercise.find(query).sort({ muscleGroup: 1, name: 1 });

    return res.json({
      success: true,
      count: exercises.length,
      exercises,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise by ID
// @route   GET /api/exercises/:id
// @access  Public or Private
const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    return res.json({ success: true, exercise });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new custom exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res, next) => {
  try {
    const { name, muscleGroup, equipment, difficulty, description, instructions } = req.body;

    if (!name || !muscleGroup) {
      return res.status(400).json({ success: false, message: 'Exercise name and muscle group are required' });
    }

    let parsedInstructions = [];
    if (Array.isArray(instructions)) {
      parsedInstructions = instructions;
    } else if (typeof instructions === 'string') {
      parsedInstructions = instructions.split('\n').filter((step) => step.trim() !== '');
    }

    const exercise = await Exercise.create({
      name,
      muscleGroup,
      equipment: equipment || 'None / Bodyweight',
      difficulty: difficulty || 'Beginner',
      description: description || '',
      instructions: parsedInstructions,
      isCustom: true,
      createdBy: req.user ? req.user._id : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = async (req, res, next) => {
  try {
    let exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    // Only allow updating if custom or if createdBy matches user
    const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, message: 'Exercise updated', exercise: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    await Exercise.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Exercise removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
