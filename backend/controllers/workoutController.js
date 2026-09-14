const Workout = require('../models/Workout');
const Goal = require('../models/Goal');

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { type, completed, search } = req.query;
    let query = { userId: req.user._id };

    if (type && type !== 'All') {
      query.type = type;
    }

    if (completed !== undefined && completed !== 'All') {
      query.completed = completed === 'true' || completed === true;
    }

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const workouts = await Workout.find(query).sort({ date: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    return res.json({ success: true, workout });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { name, type, date, duration, caloriesBurned, exercises, notes, completed } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workout name is required' });
    }

    const workout = await Workout.create({
      userId: req.user._id,
      name,
      type: type || 'Strength',
      date: date || new Date(),
      duration: duration ? Number(duration) : 30,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 200,
      exercises: exercises || [],
      notes: notes || '',
      completed: !!completed,
      completedAt: completed ? new Date() : null,
    });

    // If marked completed, update relevant goals
    if (workout.completed) {
      await Goal.updateMany(
        { userId: req.user._id, category: 'Workouts', completed: false },
        { $inc: { currentValue: 1 } }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    const wasCompleted = workout.completed;

    const updated = await Workout.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    // If freshly completed
    if (!wasCompleted && updated.completed) {
      updated.completedAt = new Date();
      await updated.save();
      await Goal.updateMany(
        { userId: req.user._id, category: 'Workouts', completed: false },
        { $inc: { currentValue: 1 } }
      );
    }

    return res.json({
      success: true,
      message: 'Workout updated successfully',
      workout: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    return res.json({ success: true, message: 'Workout removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a workout session
// @route   POST /api/workouts/:id/complete
// @access  Private
const completeWorkout = async (req, res, next) => {
  try {
    const { duration, caloriesBurned, exercises } = req.body;
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    workout.completed = true;
    workout.completedAt = new Date();
    if (duration !== undefined) workout.duration = Number(duration);
    if (caloriesBurned !== undefined) workout.caloriesBurned = Number(caloriesBurned);
    if (exercises) workout.exercises = exercises;

    await workout.save();

    // Increment workout goal counter
    await Goal.updateMany(
      { userId: req.user._id, category: 'Workouts', completed: false },
      { $inc: { currentValue: 1 } }
    );

    return res.json({
      success: true,
      message: 'Workout completed! 🔥',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
};
