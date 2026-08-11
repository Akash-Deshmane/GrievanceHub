const Complaint  = require('../models/Complaint');
const User       = require('../models/User');

// ─────────────────────────────────────────
// @POST /api/complaints
// Student: Submit a new complaint
// ─────────────────────────────────────────
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, department, priority, isAnonymous } = req.body;

    // ✅ Your middleware uses field name 'images', stores path as Cloudinary URL
    const attachments = req.files ? req.files.map(f => f.path) : [];

    const complaint = await Complaint.create({
      title,
      description,
      category,
      department,
      priority:    priority || 'Medium',
      isAnonymous: isAnonymous === 'true',
      attachments,              // ← Cloudinary URLs stored here
      student:     req.user._id,
      status:      'Pending',
      statusHistory: [{
        status:    'Pending',
        updatedBy: req.user._id,
        remark:    'Complaint submitted by student',
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data:    complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @GET /api/complaints
// Student → own complaints
// Dept Admin → their department
// Super Admin → all complaints
// ─────────────────────────────────────────
exports.getComplaints = async (req, res) => {
  try {
    let filter = {};
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;

    // Role-based filtering
    if (req.user.role === 'student')     filter.student    = req.user._id;
    if (req.user.role === 'dept_admin')  filter.department = req.user.department;
    // super_admin sees all → no filter

    // Optional query filters
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
      .populate('student',    'name email rollNo department')
      .populate('category',   'name icon')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      data:       complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @GET /api/complaints/:id
// Get a single complaint with full details
// ─────────────────────────────────────────
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student',               'name email rollNo phone department')
      .populate('category',              'name icon')
      .populate('department',            'name code')
      .populate('assignedTo',            'name email phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Student can only view their own complaints
    if (
      req.user.role === 'student' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @PUT /api/complaints/:id
// Student: Edit complaint (only if Pending)
// ─────────────────────────────────────────

exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit after complaint has been reviewed',
      });
    }

    const { title, description, category, department, priority, isAnonymous } = req.body;

    // ✅ Append new images (from your 'images' field) to existing ones
    const newImages = req.files ? req.files.map(f => f.path) : [];

    complaint.title       = title       || complaint.title;
    complaint.description = description || complaint.description;
    complaint.category    = category    || complaint.category;
    complaint.department  = department  || complaint.department;
    complaint.priority    = priority    || complaint.priority;
    complaint.isAnonymous = isAnonymous !== undefined
      ? isAnonymous === 'true'
      : complaint.isAnonymous;

    // Append new images to existing attachments
    if (newImages.length > 0) {
      complaint.attachments = [...complaint.attachments, ...newImages];
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data:    complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @DELETE /api/complaints/:id
// Student: Delete complaint (only if Pending)
// ─────────────────────────────────────────
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Only the owner can delete
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can only delete if still Pending
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete complaint after review has started',
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @PUT /api/complaints/:id/status
// Dept Admin / Super Admin: Update status
// ─────────────────────────────────────────
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks, assignedTo } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Dept Admin can only update their department's complaints
    if (
      req.user.role === 'dept_admin' &&
      complaint.department.toString() !== req.user.department.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    complaint.status  = status;
    complaint.remarks = remarks || complaint.remarks;
    if (assignedTo) complaint.assignedTo = assignedTo;

    // Track status history
    complaint.statusHistory.push({
      status,
      remark:    remarks,
      updatedBy: req.user._id,
    });

    await complaint.save();

    // Re-populate for response
    await complaint.populate('student', 'name email');

    res.json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data:    complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @POST /api/complaints/:id/rate
// Student: Rate a resolved complaint
// ─────────────────────────────────────────
exports.rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate a resolved complaint',
      });
    }

    if (complaint.rating) {
      return res.status(400).json({ success: false, message: 'You have already rated this complaint' });
    }

    complaint.rating   = rating;
    complaint.feedback = feedback;
    complaint.status   = 'Closed';

    complaint.statusHistory.push({
      status:    'Closed',
      remark:    `Student rated ${rating}/5: ${feedback}`,
      updatedBy: req.user._id,
    });

    await complaint.save();

    res.json({ success: true, message: 'Thank you for your feedback!', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @GET /api/complaints/analytics
// Admin / Super Admin: Dashboard stats
// ─────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    let matchFilter = {};
    if (req.user.role === 'dept_admin') {
      matchFilter.department = req.user.department;
    }

    const [
      total, pending, inProgress, resolved, rejected, closed,
      byCategory, byDepartment, byPriority, recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments(matchFilter),
      Complaint.countDocuments({ ...matchFilter, status: 'Pending' }),
      Complaint.countDocuments({ ...matchFilter, status: 'In Progress' }),
      Complaint.countDocuments({ ...matchFilter, status: 'Resolved' }),
      Complaint.countDocuments({ ...matchFilter, status: 'Rejected' }),
      Complaint.countDocuments({ ...matchFilter, status: 'Closed' }),

      // Group by category
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$category.name', 'Unknown'] }, count: 1, _id: 0 } },
      ]),

      // Group by department
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$dept.name', 'Unknown'] }, count: 1, _id: 0 } },
      ]),

      // Group by priority
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // 5 most recent complaints
      Complaint.find(matchFilter)
        .populate('student',  'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status priority createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        counts:           { total, pending, inProgress, resolved, rejected, closed },
        byCategory,
        byDepartment,
        byPriority,
        recentComplaints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};