const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'download', 'upload', 'update', 'delete'],
    required: true
  },
  actionDetails: {
    ip: String,
    userAgent: String,
    campus: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  duration: Number, // viewing duration in seconds
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // TTL: 90 days auto-delete for old records
  }
});

// Index for better query performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ material: 1 });
activitySchema.index({ course: 1 });
activitySchema.index({ action: 1 });
activitySchema.index({ 'actionDetails.campus': 1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

