const express = require('express');
const router  = express.Router();

const { protect }   = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { handleComplaintUpload } = require('../middlewares/upload');

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  rateComplaint,
  getAnalytics,
} = require('../controllers/complaintController');

// ── Analytics (must be BEFORE /:id routes) ──
router.get('/analytics',
  protect,
  authorize('dept_admin', 'super_admin'),
  getAnalytics
);

// ── Core CRUD ──
router.post('/',
  protect,
  authorize('student'),
  handleComplaintUpload,    // ← your wrapper (handles errors too)
  createComplaint
);

router.get('/',
  protect,
  getComplaints
);

router.get('/:id',
  protect,
  getComplaintById
);

router.put('/:id',
  protect,
  authorize('student'),
  handleComplaintUpload,    // ← for editing + adding new images
  updateComplaint
);

router.delete('/:id',
  protect,
  authorize('student'),
  deleteComplaint
);

// ── Admin Actions ──
router.put('/:id/status',
  protect,
  authorize('dept_admin', 'super_admin'),
  updateComplaintStatus
);

// ── Student Rating ──
router.post('/:id/rate',
  protect,
  authorize('student'),
  rateComplaint
);

module.exports = router;