const Calorie = require('../models/Calorie');
const User = require('../models/User');

// @desc    Get calories for user (with date filter, daily total, target, remaining)
// @route   GET /api/calories
// @access  Private
const getCalories = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    // Parse target date (default to today)
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await Calorie.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    const totalCaloriesToday = logs.reduce((sum, item) => sum + item.calories, 0);

    const user = await User.findById(req.user._id);
    const dailyTarget = user && user.dailyCalorieTarget ? user.dailyCalorieTarget : 2200;
    const remainingCalories = Math.max(0, dailyTarget - totalCaloriesToday);

    // Group by mealType
    const mealBreakdown = {
      Breakfast: 0,
      Lunch: 0,
      Dinner: 0,
      Snack: 0,
    };
    logs.forEach((log) => {
      if (mealBreakdown[log.mealType] !== undefined) {
        mealBreakdown[log.mealType] += log.calories;
      }
    });

    // Also get last 7 days daily calories for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastWeekLogs = await Calorie.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const pastWeekChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = dayNames[d.getDay()];
      const dStart = new Date(d);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayCalories = pastWeekLogs
        .filter((l) => new Date(l.date) >= dStart && new Date(l.date) <= dEnd)
        .reduce((sum, l) => sum + l.calories, 0);

      pastWeekChart.push({
        day: dayStr,
        date: d.toISOString().split('T')[0],
        calories: dayCalories,
        target: dailyTarget,
      });
    }

    return res.json({
      success: true,
      count: logs.length,
      totalCaloriesToday,
      dailyTarget,
      remainingCalories,
      mealBreakdown,
      logs,
      pastWeekChart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a calorie entry
// @route   POST /api/calories
// @access  Private
const addCalorie = async (req, res, next) => {
  try {
    const { foodName, mealType, calories, date } = req.body;

    if (!foodName || !mealType || calories === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide food name, meal type, and calories' });
    }

    const entry = await Calorie.create({
      userId: req.user._id,
      foodName,
      mealType,
      calories: Number(calories),
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete calorie entry
// @route   DELETE /api/calories/:id
// @access  Private
const deleteCalorie = async (req, res, next) => {
  try {
    const entry = await Calorie.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Calorie entry not found' });
    }
    return res.json({ success: true, message: 'Calorie log removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCalories, addCalorie, deleteCalorie };
