const Category = require('../models/Category');

// ─── @GET /api/categories  (Public) ──────────────────────
const getAllCategories = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;

    const categories = await Category.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/categories  (Super Admin) ────────────────
const createCategory = async (req, res, next) => {
  try {
    const { name, description, department, icon } = req.body;
    const category = await Category.create({ name, description, department, icon });
    await category.populate('department', 'name code');
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/categories/:id  (Public) ──────────────────
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('department', 'name code');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/categories/:id  (Super Admin) ─────────────
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, department, icon, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, department, icon, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, message: 'Category updated.', category });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/categories/:id  (Super Admin) ──────────
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, message: 'Category deactivated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory };
