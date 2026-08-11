const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

console.log({
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
});

const { protect } = require("../middlewares/auth");
const { handleProfileUpload } = require("../middlewares/upload");

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, handleProfileUpload, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
