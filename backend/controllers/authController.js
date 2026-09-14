const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_fitness_jwt_key_99928172!', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in or use a different email.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      age: age ? Number(age) : 25,
      gender: gender || 'Prefer not to say',
      height: height ? Number(height) : 175,
      weight: weight ? Number(weight) : 70,
      goal: goal || 'Improve Fitness',
      activityLevel: activityLevel || 'Intermediate',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in with your credentials.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalorieTarget: user.dailyCalorieTarget,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          bmi: user.bmi,
          bmiCategory: user.bmiCategory,
          goal: user.goal,
          activityLevel: user.activityLevel,
          dailyCalorieTarget: user.dailyCalorieTarget,
          profileImage: user.profileImage,
          googleId: user.googleId,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth - Verify access token & sign in/up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { accessToken, email, name, googleId, profileImage } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;
    let verifiedPicture = profileImage || '';

    // If an accessToken is provided, verify it with Google's userinfo endpoint
    if (accessToken) {
      const https = require('https');
      const profileData = await new Promise((resolve, reject) => {
        const request = https.request(
          {
            hostname: 'www.googleapis.com',
            path: '/oauth2/v3/userinfo',
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
          },
          (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
              try { resolve(JSON.parse(data)); }
              catch { reject(new Error('Failed to parse Google response')); }
            });
          }
        );
        request.on('error', reject);
        request.end();
      });

      if (profileData.error) {
        return res.status(401).json({ success: false, message: 'Google token verification failed.' });
      }

      verifiedEmail = profileData.email;
      verifiedName = profileData.name;
      verifiedGoogleId = profileData.sub;
      verifiedPicture = profileData.picture || '';
    }

    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: 'Google account email is required.' });
    }

    const lowerEmail = verifiedEmail.toLowerCase();
    let user = await User.findOne({
      $or: [{ googleId: verifiedGoogleId || 'non_existent_id' }, { email: lowerEmail }],
    });

    if (user) {
      // Link Google ID if not linked yet
      if (verifiedGoogleId && !user.googleId) {
        user.googleId = verifiedGoogleId;
      }
      // Update profile picture from Google if not set
      if (verifiedPicture && !user.profileImage) {
        user.profileImage = verifiedPicture;
      }
      await user.save();
    } else {
      // Create new user account with real Google info
      user = await User.create({
        name: verifiedName || lowerEmail.split('@')[0],
        email: lowerEmail,
        googleId: verifiedGoogleId || `google_${Date.now()}`,
        profileImage: verifiedPicture,
        age: 25,
        gender: 'Prefer not to say',
        height: 175,
        weight: 70,
        goal: 'Improve Fitness',
        activityLevel: 'Intermediate',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalorieTarget: user.dailyCalorieTarget,
        profileImage: user.profileImage,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Forgot Password - Request reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email.' });
    }

    // Generate 6-digit reset code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hr validity
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset code generated successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with Code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, reset code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const isTokenMatch = await bcrypt.compare(resetToken, user.resetPasswordToken);

    if (!isTokenMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password reset code.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getAuthProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalorieTarget: user.dailyCalorieTarget,
        profileImage: user.profileImage,
        googleId: user.googleId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fast Direct Login with Mail ID
// @route   POST /api/auth/fast-mail-login
// @access  Public
const fastMailLogin = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email ID.' });
    }

    const lowerEmail = email.toLowerCase();
    let user = await User.findOne({ email: lowerEmail });

    if (!user) {
      // Auto-create user account instantly with standard defaults
      const derivedName = name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const randomPassword = `fast_${Math.random().toString(36).slice(2, 10)}`;

      user = await User.create({
        name: derivedName,
        email: lowerEmail,
        password: randomPassword,
        age: 25,
        gender: 'Prefer not to say',
        height: 175,
        weight: 70,
        goal: 'Improve Fitness',
        activityLevel: 'Intermediate',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalorieTarget: user.dailyCalorieTarget,
        profileImage: user.profileImage,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  fastMailLogin,
  forgotPassword,
  resetPassword,
  getAuthProfile,
};

