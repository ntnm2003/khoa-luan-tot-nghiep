const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../schemas/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "student01"
 *               email:
 *                 type: string
 *                 example: "student01@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *                 example: "student"
 *               department:
 *                 type: string
 *                 enum: ["Công nghệ thông tin", "Sư phạm", "Kinh tế", "Khoa học xã hội"]
 *               campus:
 *                 type: string
 *                 enum: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh"]
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Lỗi xác thực
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, fullName, role, department, campus } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc username đã tồn tại'
      });
    }

    user = new User({
      username,
      email,
      password,
      fullName,
      role: role || 'student',
      department,
      campus: campus || 'Hà Nội'
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student01@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc'
      });
    }

    // Check for user (add password field since it's not returned by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Không được phép truy cập
 */
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

