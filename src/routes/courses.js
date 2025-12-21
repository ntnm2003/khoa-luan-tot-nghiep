const express = require('express');
const Course = require('../schemas/Course');
const Material = require('../schemas/Material');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách khóa học
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *           enum: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh"]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách khóa học
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    if (req.query.department) query.department = req.query.department;
    if (req.query.campus) query.campusOfferingLocation = req.query.campus;
    if (req.query.status) query.status = req.query.status;

    // Students only see active courses
    if (req.user.role === 'student') {
      query.status = 'active';
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .populate('instructor', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết một khóa học
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết khóa học
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'fullName email')
      .populate('students', 'fullName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Khóa học không tìm thấy'
      });
    }

    // Get course materials count
    const materialsCount = await Material.countDocuments({ course: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        materialsCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Tạo khóa học mới (Teacher/Admin)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *               courseName:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: number
 *               department:
 *                 type: string
 *               semester:
 *                 type: string
 *               campusOfferingLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Khóa học được tạo thành công
 */
router.post('/', protect, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    const { courseCode, courseName, description, credits, department, semester, campusOfferingLocation } = req.body;

    const course = new Course({
      courseCode,
      courseName,
      description,
      credits,
      department,
      instructor: req.user._id,
      semester,
      campusOfferingLocation: campusOfferingLocation || req.user.campus
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Khóa học được tạo thành công',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Cập nhật khóa học (Instructor/Admin)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Khóa học được cập nhật thành công
 */
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Khóa học không tìm thấy'
      });
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa khóa học này'
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Khóa học được cập nhật thành công',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Đăng ký khóa học (Student)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
router.post('/:id/enroll', protect, authorize('student'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Khóa học không tìm thấy'
      });
    }

    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này'
      });
    }

    course.students.push(req.user._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đăng ký khóa học thành công',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

