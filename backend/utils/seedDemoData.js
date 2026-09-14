const User = require('../models/User');
const Workout = require('../models/Workout');
const Weight = require('../models/Weight');
const Goal = require('../models/Goal');
const Calorie = require('../models/Calorie');

const seedDemoUserData = async () => {
  try {
    const email = 'alex@example.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: 'Alex Hunter',
        email,
        password: 'password123',
        age: 28,
        gender: 'Male',
        height: 180,
        weight: 76.5,
        goal: 'Gain Muscle',
        activityLevel: 'Intermediate',
        dailyCalorieTarget: 2400,
      });
      console.log('Demo user Alex Hunter created.');
    }

    const userId = user._id;

    // Check if user already has workouts
    const workoutCount = await Workout.countDocuments({ userId });
    if (workoutCount === 0) {
      console.log('Seeding demo workouts for Alex Hunter...');

      const now = new Date();

      // Workout 1: Today
      await Workout.create({
        userId,
        name: 'Upper Body Power & Chest',
        type: 'Strength',
        date: new Date(),
        duration: 45,
        caloriesBurned: 420,
        completed: true,
        completedAt: new Date(),
        notes: 'Hit new personal best on Barbell Bench Press!',
        exercises: [
          {
            name: 'Barbell Bench Press',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, reps: 10, weight: 75, completed: true },
              { setNumber: 2, reps: 8, weight: 80, completed: true },
              { setNumber: 3, reps: 6, weight: 85, completed: true },
            ],
          },
          {
            name: 'Incline Dumbbell Press',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, reps: 10, weight: 28, completed: true },
              { setNumber: 2, reps: 10, weight: 30, completed: true },
              { setNumber: 3, reps: 8, weight: 32, completed: true },
            ],
          },
          {
            name: 'Tricep Cable Pushdowns',
            muscleGroup: 'Arms',
            sets: [
              { setNumber: 1, reps: 12, weight: 35, completed: true },
              { setNumber: 2, reps: 12, weight: 40, completed: true },
            ],
          },
        ],
      });

      // Workout 2: 1 day ago
      const day1Ago = new Date(now);
      day1Ago.setDate(now.getDate() - 1);
      await Workout.create({
        userId,
        name: 'Back & Core Hypertrophy',
        type: 'Strength',
        date: day1Ago,
        duration: 50,
        caloriesBurned: 460,
        completed: true,
        completedAt: day1Ago,
        notes: 'Great lat stretch and steady form on deadlifts.',
        exercises: [
          {
            name: 'Pull Ups',
            muscleGroup: 'Back',
            sets: [
              { setNumber: 1, reps: 10, weight: 0, completed: true },
              { setNumber: 2, reps: 8, weight: 0, completed: true },
              { setNumber: 3, reps: 8, weight: 0, completed: true },
            ],
          },
          {
            name: 'Barbell Deadlift',
            muscleGroup: 'Back',
            sets: [
              { setNumber: 1, reps: 6, weight: 120, completed: true },
              { setNumber: 2, reps: 6, weight: 130, completed: true },
            ],
          },
        ],
      });

      // Workout 3: 2 days ago
      const day2Ago = new Date(now);
      day2Ago.setDate(now.getDate() - 2);
      await Workout.create({
        userId,
        name: 'Leg Day & Quads Focus',
        type: 'Strength',
        date: day2Ago,
        duration: 55,
        caloriesBurned: 510,
        completed: true,
        completedAt: day2Ago,
        notes: 'Heavy squat session.',
        exercises: [
          {
            name: 'Barbell Back Squats',
            muscleGroup: 'Legs',
            sets: [
              { setNumber: 1, reps: 8, weight: 100, completed: true },
              { setNumber: 2, reps: 8, weight: 110, completed: true },
              { setNumber: 3, reps: 6, weight: 115, completed: true },
            ],
          },
        ],
      });

      // Workout 4: 4 days ago
      const day4Ago = new Date(now);
      day4Ago.setDate(now.getDate() - 4);
      await Workout.create({
        userId,
        name: 'High-Intensity Cardio Conditioning',
        type: 'Cardio',
        date: day4Ago,
        duration: 35,
        caloriesBurned: 380,
        completed: true,
        completedAt: day4Ago,
        notes: 'Treadmill tempo intervals.',
        exercises: [
          {
            name: 'Treadmill Running / Jogging',
            muscleGroup: 'Cardio',
            sets: [
              { setNumber: 1, reps: 20, weight: 0, completed: true },
            ],
          },
        ],
      });

      console.log('Demo workouts created.');
    }

    // Weight logs
    const weightCount = await Weight.countDocuments({ userId });
    if (weightCount === 0) {
      console.log('Seeding demo weight history...');
      const dates = [14, 10, 7, 4, 1, 0];
      const weights = [79.2, 78.5, 78.0, 77.4, 76.8, 76.5];
      for (let i = 0; i < dates.length; i++) {
        const d = new Date();
        d.setDate(d.getDate() - dates[i]);
        await Weight.create({
          userId,
          weight: weights[i],
          date: d,
          notes: i === 0 ? 'Starting baseline' : 'Weigh-in fasted',
        });
      }
    }

    // Goals
    const goalCount = await Goal.countDocuments({ userId });
    if (goalCount === 0) {
      console.log('Seeding demo goals...');
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      await Goal.create({
        userId,
        name: 'Complete 30 Workouts this Month',
        category: 'Workouts',
        targetValue: 30,
        currentValue: 18,
        unit: 'sessions',
        targetDate,
        completed: false,
      });

      await Goal.create({
        userId,
        name: 'Reach Goal Weight of 75 kg',
        category: 'Weight',
        targetValue: 75,
        currentValue: 76.5,
        unit: 'kg',
        targetDate,
        completed: false,
      });

      await Goal.create({
        userId,
        name: 'Bench Press 100 kg PR',
        category: 'Strength',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        targetDate,
        completed: false,
      });
    }

    // Calories for today
    const calCount = await Calorie.countDocuments({ userId });
    if (calCount === 0) {
      console.log('Seeding demo calorie meals...');
      await Calorie.create([
        {
          userId,
          foodName: 'Oatmeal with whey protein, chia seeds & banana',
          mealType: 'Breakfast',
          calories: 520,
          date: new Date(),
        },
        {
          userId,
          foodName: 'Grilled chicken breast with quinoa and avocado salad',
          mealType: 'Lunch',
          calories: 680,
          date: new Date(),
        },
        {
          userId,
          foodName: 'Greek yogurt with almonds and honey',
          mealType: 'Snack',
          calories: 260,
          date: new Date(),
        },
      ]);
    }
  } catch (err) {
    console.error('Error seeding demo data:', err.message);
  }
};

module.exports = { seedDemoUserData };
