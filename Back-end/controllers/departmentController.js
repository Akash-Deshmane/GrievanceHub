const Department = require('../models/Department');
const User = require('../models/User');

// ─── @GET /api/departments  (Auth) ───────────────────────
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('adminUser', 'name email')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/departments/:id  (Auth) ───────────────────
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('adminUser', 'name email');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/departments  (Super Admin) ───────────────
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, adminUser } = req.body;
    const department = await Department.create({ name, code, description, adminUser });
    res.status(201).json({ success: true, message: 'Department created.', department });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/departments/:id  (Super Admin) ────────────
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, adminUser, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, adminUser, isActive },
      { new: true, runValidators: true }
    ).populate('adminUser', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // If adminUser is being assigned, update their role to dept_admin
    if (adminUser) {
      await User.findByIdAndUpdate(adminUser, {
        role: 'dept_admin',
        department: department._id,
      });
    }

    res.status(200).json({ success: true, message: 'Department updated.', department });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/departments/:id  (Super Admin) ─────────
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.status(200).json({ success: true, message: 'Department deactivated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
