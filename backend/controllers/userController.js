const User = require('../models/User');
const Weight = require('../models/Weight');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
      dailyCalorieTarget,
      profileImage,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = Number(age);
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    
    // If weight updated, create a weight entry if changed
    if (weight !== undefined && Number(weight) !== user.weight) {
      user.weight = Number(weight);
      await Weight.create({
        userId: user._id,
        weight: Number(weight),
        date: new Date(),
        notes: 'Profile weight update',
      });
    }

    if (goal !== undefined) user.goal = goal;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (dailyCalorieTarget !== undefined) user.dailyCalorieTarget = Number(dailyCalorieTarget);
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        bmi: updatedUser.bmi,
        bmiCategory: updatedUser.bmiCategory,
        goal: updatedUser.goal,
        activityLevel: updatedUser.activityLevel,
        dailyCalorieTarget: updatedUser.dailyCalorieTarget,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword };
