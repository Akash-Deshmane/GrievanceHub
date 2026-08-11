const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect } = require("../middlewares/auth");
const { authorize } = require("../middlewares/role");

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Super Admin only
router.post('/', protect, authorize('super_admin'), createCategory);
router.put('/:id', protect, authorize('super_admin'), updateCategory);
router.delete('/:id', protect, authorize('super_admin'), deleteCategory);

module.exports = router;
