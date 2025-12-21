const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Mã khóa học là bắt buộc'],
    unique: true,
    uppercase: true
  },
  courseName: {
    type: String,
    required: [true, 'Tên khóa học là bắt buộc']
  },
  description: String,
  credits: {
    type: Number,
    min: 1,
    max: 4
  },
  department: {
    type: String,
    enum: ['Công nghệ thông tin', 'Sư phạm', 'Kinh tế', 'Khoa học xã hội'],
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  semester: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  campusOfferingLocation: {
    type: String,
    enum: ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  totalMaterials: {
    type: Number,
    default: 0
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
courseSchema.index({ department: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ campusOfferingLocation: 1 });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ status: 1 });

module.exports = mongoose.model('Course', courseSchema);

