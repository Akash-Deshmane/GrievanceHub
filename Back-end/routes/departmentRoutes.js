const express = require('express');
const router = express.Router();

const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Public: Allow fetching departments for registration
router.get('/', getAllDepartments);

// All other routes require authentication
router.use(protect);

router.get('/:id', getDepartmentById);

// Super Admin only
router.post('/', authorize('super_admin'), createDepartment);
router.put('/:id', authorize('super_admin'), updateDepartment);
router.delete('/:id', authorize('super_admin'), deleteDepartment);

module.exports = router;
