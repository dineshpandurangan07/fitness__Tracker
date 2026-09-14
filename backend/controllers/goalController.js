const Goal = require('../models/Goal');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new fitness goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { name, category, targetValue, currentValue, targetDate, unit } = req.body;

    if (!name || !targetValue || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide goal name, target value, and target date' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      name,
      category: category || 'Workouts',
      targetValue: Number(targetValue),
      currentValue: currentValue ? Number(currentValue) : 0,
      targetDate: new Date(targetDate),
      unit: unit || '',
      completed: currentValue && Number(currentValue) >= Number(targetValue),
    });

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal (currentValue, completed, targetDate, etc.)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { name, category, targetValue, currentValue, targetDate, completed, unit } = req.body;

    if (name !== undefined) goal.name = name;
    if (category !== undefined) goal.category = category;
    if (targetValue !== undefined) goal.targetValue = Number(targetValue);
    if (currentValue !== undefined) goal.currentValue = Number(currentValue);
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (unit !== undefined) goal.unit = unit;

    // Auto mark completed if currentValue >= targetValue
    if (completed !== undefined) {
      goal.completed = completed;
    } else if (goal.currentValue >= goal.targetValue && goal.targetValue > 0) {
      goal.completed = true;
    }

    const updated = await goal.save();

    return res.json({
      success: true,
      message: 'Goal updated successfully',
      goal: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    return res.json({ success: true, message: 'Goal removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
