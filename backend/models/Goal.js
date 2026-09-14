const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Weight', 'Workouts', 'Running', 'Strength', 'Calorie', 'Other'],
      default: 'Workouts',
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
