const User = require('../models/User');
const generateToken = require("../utils/generateToken");
const cloudinary = require('../config/cloudinary');

// ─── @POST /api/auth/register  (Public) ──────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, rollNumber, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      rollNumber,
      phone,
      role: 'student', // Students can only self-register
    });

const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/login  (Public) ─────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user with password (select: false by default)
    const user = await User.findOne({ email })
      .select('+password')
      .populate('department', 'name code');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        profileImage: user.profileImage,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/auth/me  (Private) ────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department', 'name code');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/update-profile  (Private) ────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };

    // If a new profile image was uploaded
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/change-password  (Private) ────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
