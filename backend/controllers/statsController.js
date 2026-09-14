const Workout = require('../models/Workout');
const Weight = require('../models/Weight');
const Goal = require('../models/Goal');
const Calorie = require('../models/Calorie');
const User = require('../models/User');

// Helper to compute consecutive active workout days (streak)
const calculateStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return { currentStreak: 0, bestStreak: 0 };

  // Collect unique dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      workouts
        .filter((w) => w.completed)
        .map((w) => {
          const d = new Date(w.completedAt || w.date);
          return d.toISOString().split('T')[0];
        })
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Check if active today or yesterday to continue streak
  const mostRecent = uniqueDates[0];
  const isStreakAlive = mostRecent === todayStr || mostRecent === yesterdayStr;

  // Calculate current streak
  if (isStreakAlive) {
    let expectedDate = new Date(mostRecent);
    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr);
      const diffTime = Math.abs(expectedDate - currentDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak++;
        expectedDate = currentDate;
      } else {
        break;
      }
    }
  }

  // Calculate best streak historically
  const sortedDatesAsc = [...uniqueDates].reverse();
  for (let i = 0; i < sortedDatesAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDatesAsc[i - 1]);
      const curr = new Date(sortedDatesAsc[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
};

// @desc    Get aggregated stats for main dashboard
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get user profile
    const user = await User.findById(userId);

    // 2. All workouts for user
    const allWorkouts = await Workout.find({ userId }).sort({ date: -1 });
    const completedWorkouts = allWorkouts.filter((w) => w.completed);

    // 3. Today's start and end
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Today's workout (any scheduled or completed today)
    const todayWorkout = allWorkouts.find((w) => {
      const wDate = new Date(w.date);
      return wDate >= startOfToday && wDate <= endOfToday;
    }) || null;

    // 4. This week's start (Monday) and end (Sunday)
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklyWorkouts = completedWorkouts.filter((w) => {
      const d = new Date(w.completedAt || w.date);
      return d >= monday && d <= sunday;
    });

    // 5. This month's workouts
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyWorkouts = completedWorkouts.filter((w) => {
      const d = new Date(w.completedAt || w.date);
      return d >= startOfMonth;
    });

    // 6. Calories burned this week
    const weeklyCaloriesBurned = weeklyWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // 7. Total workout duration (in minutes)
    const totalWorkoutDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // 8. Weekly chart data (Monday through Sunday)
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyChartData = daysOfWeek.map((dayName, idx) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + idx);
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      const dayWorkouts = completedWorkouts.filter((w) => {
        const d = new Date(w.completedAt || w.date);
        return d >= dayStart && d <= dayEnd;
      });

      const workoutsCount = dayWorkouts.length;
      const calories = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      const minutes = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

      return {
        day: dayName,
        date: targetDate.toISOString().split('T')[0],
        workouts: workoutsCount,
        calories,
        minutes,
      };
    });

    // 9. Streak calculation
    const { currentStreak, bestStreak } = calculateStreak(completedWorkouts);

    // 10. Weight stats
    const weightLogs = await Weight.find({ userId }).sort({ date: 1 });
    const startingWeight = weightLogs.length > 0 ? weightLogs[0].weight : (user ? user.weight : 70);
    const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : (user ? user.weight : 70);
    const weightChange = Number((currentWeight - startingWeight).toFixed(1));

    // 11. Goal progress overview
    const goals = await Goal.find({ userId });
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const overallGoalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // 12. Recent 5 workouts
    const recentWorkouts = allWorkouts.slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalWorkouts: completedWorkouts.length,
        weeklyWorkoutsCount: weeklyWorkouts.length,
        monthlyWorkoutsCount: monthlyWorkouts.length,
        weeklyCaloriesBurned,
        totalCaloriesBurned,
        totalWorkoutDuration,
        currentStreak,
        bestStreak,
        startingWeight,
        currentWeight,
        weightChange,
        goalProgress: overallGoalProgress,
        todayWorkout,
        weeklyChartData,
        recentWorkouts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed progress charts and statistics
// @route   GET /api/stats/progress
// @access  Private
const getProgressStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. All completed workouts
    const workouts = await Workout.find({ userId, completed: true }).sort({ date: 1 });

    // 2. Weight progress logs
    const weightLogs = await Weight.find({ userId }).sort({ date: 1 });
    const weightChartData = weightLogs.map((log) => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: log.weight,
      rawDate: log.date,
    }));

    // 3. Workouts per week for last 8 weeks
    const today = new Date();
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(today.getDate() - 56);

    const weeklyFrequency = [];
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);

      const weekWorkouts = workouts.filter((w) => {
        const d = new Date(w.completedAt || w.date);
        return d >= weekStart && d <= weekEnd;
      });

      const label = `Wk ${8 - i}`;
      weeklyFrequency.push({
        week: label,
        workouts: weekWorkouts.length,
        calories: weekWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0),
        duration: weekWorkouts.reduce((s, w) => s + (w.duration || 0), 0),
      });
    }

    // 4. Totals and Streaks
    const { currentStreak, bestStreak } = calculateStreak(workouts);
    const totalCalories = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

    return res.json({
      success: true,
      data: {
        totalWorkouts: workouts.length,
        totalCaloriesBurned: totalCalories,
        totalWorkoutMinutes: totalMinutes,
        currentStreak,
        bestStreak,
        weightChartData,
        weeklyFrequency,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getProgressStats };
