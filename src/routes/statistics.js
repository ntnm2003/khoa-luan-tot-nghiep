const express = require('express');
const Activity = require('../schemas/Activity');
const Material = require('../schemas/Material');
const Course = require('../schemas/Course');
const User = require('../schemas/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/statistics/materials:
 *   get:
 *     summary: Thống kê tài liệu (views, downloads)
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Thống kê tài liệu
 */
router.get('/materials', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const query = {};

    if (req.query.course) query.course = req.query.course;

    const materials = await Material.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          totalViews: { $first: '$viewCount' },
          totalDownloads: { $first: '$downloadCount' },
          course: { $first: '$course' },
          uploader: { $first: '$uploader' }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 20 }
    ]);

    const stats = {
      totalMaterials: materials.length,
      totalViews: materials.reduce((sum, m) => sum + m.totalViews, 0),
      totalDownloads: materials.reduce((sum, m) => sum + m.totalDownloads, 0),
      topMaterials: materials
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/statistics/activities:
 *   get:
 *     summary: Thống kê hoạt động theo ngày hoặc người dùng
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, user, action]
 *           default: day
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thống kê hoạt động
 */
router.get('/activities', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const groupBy = req.query.groupBy || 'day';
    const query = {};

    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    if (req.query.campus) {
      query['actionDetails.campus'] = req.query.campus;
    }

    let groupField;
    if (groupBy === 'day') {
      groupField = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (groupBy === 'user') {
      groupField = '$user';
    } else if (groupBy === 'action') {
      groupField = '$action';
    }

    const activities = await Activity.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
          actions: { $push: '$action' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        groupBy,
        total: activities.reduce((sum, a) => sum + a.count, 0),
        activities
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/statistics/users:
 *   get:
 *     summary: Thống kê người dùng theo vai trò và cơ sở
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê người dùng
 */
router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: {
            role: '$role',
            campus: '$campus'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.role': 1, '_id.campus': 1 } }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsersLastWeek: activeUsers,
        breakdown: userStats
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/statistics/dashboard:
 *   get:
 *     summary: Dashboard thống kê tổng hợp
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tổng hợp thống kê
 */
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalMaterials = await Material.countDocuments();
    const totalActivities = await Activity.countDocuments();

    // Activities in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivities = await Activity.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Top materials
    const topMaterials = await Material.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title viewCount downloadCount');

    // Activities by action type
    const activitiesByAction = await Activity.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalCourses,
          totalMaterials,
          totalActivities,
          recentActivitiesLastWeek: recentActivities
        },
        topMaterials,
        activitiesByAction
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

