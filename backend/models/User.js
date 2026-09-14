const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      default: 25,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    height: {
      type: Number, // in cm
      default: 175,
    },
    weight: {
      type: Number, // in kg
      default: 70,
    },
    goal: {
      type: String,
      enum: ['Lose Weight', 'Gain Muscle', 'Maintain Weight', 'Improve Fitness', 'Increase Strength'],
      default: 'Improve Fitness',
    },
    activityLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    dailyCalorieTarget: {
      type: Number,
      default: 2200,
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for BMI: weight in kg / (height in meters ^ 2)
userSchema.virtual('bmi').get(function () {
  if (!this.height || !this.weight || this.height <= 0) return 0;
  const heightM = this.height / 100;
  return Number((this.weight / (heightM * heightM)).toFixed(1));
});

// Virtual for BMI Category
userSchema.virtual('bmiCategory').get(function () {
  const bmi = this.bmi;
  if (!bmi) return 'N/A';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
