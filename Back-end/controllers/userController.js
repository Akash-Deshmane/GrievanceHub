const User = require('../models/User');
const Complaint = require('../models/Complaint');

// ─── @GET /api/users  (Super Admin) ──────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, isActive, page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/:id  (Super Admin) ──────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name code');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/users/:id/toggle  (Super Admin) ─────────
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/users/create-admin  (Super Admin) ────────
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      department,
      role: 'dept_admin',
    });

    res.status(201).json({
      success: true,
      message: 'Department admin created successfully.',
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/users/:id  (Super Admin) ──────────────────
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, phone },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User updated.', user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, toggleUserActive, createAdmin, updateUser };
