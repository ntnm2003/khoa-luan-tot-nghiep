const express = require('express');
const Material = require('../schemas/Material');
const Course = require('../schemas/Course');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Lấy danh sách tài liệu với lọc và tìm kiếm
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: ID của khóa học
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [lecture, assignment, exam, reference, resource]
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [pdf, doc, docx, ppt, pptx, video, image, other]
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *           enum: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh"]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, mostViewed, mostDownloaded]
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
 *         description: Danh sách tài liệu
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let query = { isPublished: true };

    // Campus filtering based on user role
    // Admin can see all, Teacher/Student can only see their campus
    if (req.user.role !== 'admin') {
      query.campus = req.user.campus;
    } else if (req.query.campus) {
      // Admin can optionally filter by campus if specified
      query.campus = req.query.campus;
    }

    // Lọc theo khóa học
    if (req.query.course) {
      query.course = req.query.course;
    }

    // Lọc theo danh mục
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Lọc theo loại file
    if (req.query.fileType) {
      query.fileType = req.query.fileType;
    }


    // Tìm kiếm văn bản
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sắp xếp
    let sort = { createdAt: -1 };
    if (req.query.sort === 'mostViewed') {
      sort = { viewCount: -1 };
    } else if (req.query.sort === 'mostDownloaded') {
      sort = { downloadCount: -1 };
    } else if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const materials = await Material.find(query)
      .populate('course', 'courseName courseCode')
      .populate('uploader', 'fullName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Material.countDocuments(query);

    res.status(200).json({
      success: true,
      data: materials,
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
 * /api/materials/{id}:
 *   get:
 *     summary: Lấy chi tiết một tài liệu
 *     tags: [Materials]
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
 *         description: Chi tiết tài liệu
 *       404:
 *         description: Tài liệu không tìm thấy
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('course', 'courseName courseCode')
     .populate('uploader', 'fullName email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tìm thấy'
      });
    }

    // Log activity
    await logActivity(req.user.id, material._id, material.course, 'view', req.user.campus);

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Tạo tài liệu mới (Teacher/Admin)
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               course:
 *                 type: string
 *               fileType:
 *                 type: string
 *                 enum: [pdf, doc, docx, ppt, pptx, video, image, other]
 *               fileUrl:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [lecture, assignment, exam, reference, resource]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tài liệu được tạo thành công
 */
router.post('/', protect, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    const { title, description, course, fileType, fileUrl, fileSize, category, tags } = req.body;

    // Verify course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Khóa học không tìm thấy'
      });
    }

    const material = new Material({
      title,
      description,
      course,
      uploader: req.user._id,
      fileType,
      fileUrl,
      fileSize,
      category: category || 'resource',
      tags: tags || [],
      campus: req.user.campus
    });

    await material.save();

    // Update course material count
    await Course.findByIdAndUpdate(
      course,
      { $inc: { totalMaterials: 1 } }
    );

    // Log activity
    await logActivity(req.user.id, material._id, course, 'upload', req.user.campus);

    res.status(201).json({
      success: true,
      message: 'Tài liệu được tạo thành công',
      data: material
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Cập nhật tài liệu (Teacher/Admin)
 *     tags: [Materials]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *     responses:
 *       200:
 *         description: Tài liệu được cập nhật thành công
 */
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tìm thấy'
      });
    }

    // Check ownership (teacher can only edit their own materials)
    if (req.user.role === 'teacher' && material.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tài liệu này'
      });
    }

    material = await Material.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Log activity
    await logActivity(req.user.id, material._id, material.course, 'update', req.user.campus);

    res.status(200).json({
      success: true,
      message: 'Tài liệu được cập nhật thành công',
      data: material
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     summary: Xóa tài liệu (Teacher/Admin)
 *     tags: [Materials]
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
 *         description: Tài liệu được xóa thành công
 */
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tìm thấy'
      });
    }

    // Check ownership
    if (req.user.role === 'teacher' && material.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài liệu này'
      });
    }

    const course = material.course;
    await Material.findByIdAndDelete(req.params.id);

    // Update course material count
    await Course.findByIdAndUpdate(
      course,
      { $inc: { totalMaterials: -1 } }
    );

    // Log activity
    await logActivity(req.user.id, material._id, course, 'delete', req.user.campus);

    res.status(200).json({
      success: true,
      message: 'Tài liệu được xóa thành công'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/materials/{id}/download:
 *   post:
 *     summary: Ghi nhận lượt tải tài liệu
 *     tags: [Materials]
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
 *         description: Lượt tải được ghi nhận
 */
router.post('/:id/download', protect, async (req, res, next) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tìm thấy'
      });
    }

    // Log activity
    await logActivity(req.user.id, material._id, material.course, 'download', req.user.campus);

    res.status(200).json({
      success: true,
      message: 'Lượt tải được ghi nhận',
      data: material
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

