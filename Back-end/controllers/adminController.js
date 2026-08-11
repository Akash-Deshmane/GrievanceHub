const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

// ─── @GET /api/admin/stats  (Super Admin / Dept Admin) ───
const getDashboardStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'dept_admin') {
      filter.department = req.user.department;
    }

    // Overall counts
    const [total, pending, under_review, in_progress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'pending' }),
      Complaint.countDocuments({ ...filter, status: 'under_review' }),
      Complaint.countDocuments({ ...filter, status: 'in_progress' }),
      Complaint.countDocuments({ ...filter, status: 'resolved' }),
      Complaint.countDocuments({ ...filter, status: 'rejected' }),
    ]);

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayFilter = { ...filter, createdAt: { $gte: todayStart } };
    const resolvedTodayFilter = { ...filter, resolvedAt: { $gte: todayStart } };

    const [todayNew, todayResolved] = await Promise.all([
      Complaint.countDocuments(todayFilter),
      Complaint.countDocuments(resolvedTodayFilter),
    ]);

    // Priority breakdown
    const priorityStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Complaints per department (Super Admin only)
    let departmentStats = [];
    if (req.user.role === 'super_admin') {
      departmentStats = await Complaint.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: '$department' },
        {
          $project: {
            name: '$department.name',
            code: '$department.code',
            count: 1,
            resolved: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Total users by role (Super Admin only)
      var userStats = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);
    }

    // Monthly trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      { $match: { ...filter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        overview: { total, pending, under_review, in_progress, resolved, rejected },
        today: { new: todayNew, resolved: todayResolved },
        priority: priorityStats,
        departmentStats,
        userStats: userStats || [],
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/admin/reports  (Super Admin) ───────────────
const getReports = async (req, res, next) => {
  try {
    const { from, to, department } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (department) filter.department = department;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email rollNumber')
      .populate('category', 'name')
      .populate('department', 'name code')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getReports };
