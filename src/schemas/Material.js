const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề tài liệu là bắt buộc']
  },
  description: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  contentType: String,
  category: {
    type: String,
    enum: ['lecture', 'assignment', 'exam', 'reference', 'resource'],
    default: 'resource'
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  campus: {
    type: String,
    enum: ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
materialSchema.index({ course: 1 });
materialSchema.index({ uploader: 1 });
materialSchema.index({ campus: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ fileType: 1 });
materialSchema.index({ title: 'text', description: 'text', tags: 'text' });
materialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);

