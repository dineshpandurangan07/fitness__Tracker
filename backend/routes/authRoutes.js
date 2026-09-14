const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  fastMailLogin,
  forgotPassword,
  resetPassword,
  getAuthProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/fast-mail-login', fastMailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getAuthProfile);

module.exports = router;

