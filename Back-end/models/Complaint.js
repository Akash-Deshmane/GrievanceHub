const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────
const remarkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remark: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// ─── Main Complaint Schema ────────────────────────────────
const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    attachments: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    remarks: [remarkSchema],
    statusHistory: [statusHistorySchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────
complaintSchema.index({ student: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 }); // Compound for admin filtering

// ─── Pre-save: Auto-push initial status to history ────────
complaintSchema.pre('save', function () {
  if (this.isNew) {
    // Controller handles pushing the initial status
  }
  // Set resolvedAt when status becomes resolved
  if (this.isModified('status') && this.status === 'Resolved') {
    this.resolvedAt = new Date();
  }
});

// ─── Virtual: days open ───────────────────────────────────
complaintSchema.virtual('daysOpen').get(function () {
  const end = this.resolvedAt || new Date();
  const diff = end - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Complaint', complaintSchema);
