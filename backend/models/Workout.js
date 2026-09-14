const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    default: 10,
  },
  weight: {
    type: Number, // in kg
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
  },
  name: {
    type: String,
    required: true,
  },
  muscleGroup: {
    type: String,
    default: 'Full Body',
  },
  sets: [setSchema],
  restTimeSeconds: {
    type: Number,
    default: 60,
  },
});

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Full Body'],
      default: 'Strength',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    caloriesBurned: {
      type: Number,
      default: 200,
    },
    exercises: [workoutExerciseSchema],
    notes: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;
