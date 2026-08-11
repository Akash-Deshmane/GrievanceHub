const express = require('express');
const router = express.Router();

const  {getDashboardStats, getReports}  = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// All admin routes require authentication
router.use(protect);

// Stats accessible by both dept_admin (filtered) and super_admin
router.get('/stats', authorize('dept_admin', 'super_admin'), getDashboardStats);

// Reports: Super Admin only
router.get('/reports', authorize('super_admin'), getReports);

module.exports = router;
