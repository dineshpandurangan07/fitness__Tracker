const Weight = require('../models/Weight');
const User = require('../models/User');
const Goal = require('../models/Goal');

// @desc    Get all weight logs for user with statistics
// @route   GET /api/weight
// @access  Private
const getWeightLogs = async (req, res, next) => {
  try {
    const weights = await Weight.find({ userId: req.user._id }).sort({ date: 1 });

    const user = await User.findById(req.user._id);

    const startingWeight = weights.length > 0 ? weights[0].weight : (user ? user.weight : 0);
    const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : (user ? user.weight : 0);
    const weightChange = Number((currentWeight - startingWeight).toFixed(1));

    // Check if there is a weight goal
    const weightGoal = await Goal.findOne({ userId: req.user._id, category: 'Weight' }).sort({ createdAt: -1 });
    const goalWeight = weightGoal ? weightGoal.targetValue : null;

    return res.json({
      success: true,
      count: weights.length,
      startingWeight,
      currentWeight,
      weightChange,
      goalWeight,
      weights,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a weight log
// @route   POST /api/weight
// @access  Private
const addWeightLog = async (req, res, next) => {
  try {
    const { weight, date, notes } = req.body;

    if (!weight) {
      return res.status(400).json({ success: false, message: 'Weight is required' });
    }

    const weightNum = Number(weight);

    const entry = await Weight.create({
      userId: req.user._id,
      weight: weightNum,
      date: date || new Date(),
      notes: notes || '',
    });

    // Update current weight in User document
    await User.findByIdAndUpdate(req.user._id, { weight: weightNum });

    // Update active Weight goal if exists
    await Goal.updateMany(
      { userId: req.user._id, category: 'Weight' },
      { currentValue: weightNum }
    );

    return res.status(201).json({
      success: true,
      message: 'Weight logged successfully',
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete weight log
// @route   DELETE /api/weight/:id
// @access  Private
const deleteWeightLog = async (req, res, next) => {
  try {
    const entry = await Weight.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Weight log not found' });
    }

    // Recalculate latest weight for user
    const latest = await Weight.findOne({ userId: req.user._id }).sort({ date: -1 });
    if (latest) {
      await User.findByIdAndUpdate(req.user._id, { weight: latest.weight });
    }

    return res.json({ success: true, message: 'Weight log deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWeightLogs, addWeightLog, deleteWeightLog };
