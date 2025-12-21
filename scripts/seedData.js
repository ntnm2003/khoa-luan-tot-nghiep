require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Import schemas
const User = require('../src/schemas/User');
const Course = require('../src/schemas/Course');
const Material = require('../src/schemas/Material');
const Activity = require('../src/schemas/Activity');

const connectDB = require('../src/config/database');

const departments = ['Công nghệ thông tin', 'Sư phạm', 'Kinh tế', 'Khoa học xã hội'];
const campuses = ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh'];
const fileTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image'];
const categories = ['lecture', 'assignment', 'exam', 'reference', 'resource'];
const semesters = ['20231', '20232', '20241', '20242'];

// Mock data generators
const generateUsers = () => {
  const users = [];
  const roles = ['admin', 'teacher', 'student'];

  // 1 Admin
  users.push({
    username: 'admin',
    email: 'admin@hnue.edu.vn',
    password: 'Admin@123456',
    fullName: 'Trần Văn Quản Trị',
    role: 'admin',
    department: departments[0],
    campus: campuses[0],
    isActive: true
  });

  // 15 Teachers (5 per department)
  for (let i = 1; i <= 15; i++) {
    const dept = departments[(i - 1) % 4];
    const campus = campuses[(i - 1) % 3];
    users.push({
      username: `teacher${i:02d}`,
      email: `teacher${i}@hnue.edu.vn`,
      password: 'Teacher@123456',
      fullName: `Giảng viên ${i}`,
      role: 'teacher',
      department: dept,
      campus: campus,
      isActive: true
    });
  }

  // 200+ Students
  for (let i = 1; i <= 250; i++) {
    const dept = departments[Math.floor(Math.random() * 4)];
    const campus = campuses[Math.floor(Math.random() * 3)];
    users.push({
      username: `student${i.toString().padStart(3, '0')}`,
      email: `student${i}@student.hnue.edu.vn`,
      password: 'Student@123456',
      fullName: `Học viên ${i}`,
      role: 'student',
      department: dept,
      campus: campus,
      isActive: Math.random() > 0.1
    });
  }

  return users;
};

const generateCourses = (teacherIds) => {
  const courses = [];
  const courseNames = [
    'Cơ sở dữ liệu NoSQL',
    'Lập trình Node.js',
    'JavaScript Nâng cao',
    'Thiết kế hệ thống phân tán',
    'MongoDB và Mongoose',
    'API RESTful Development',
    'Bảo mật ứng dụng web',
    'Performance Optimization',
    'Microservices Architecture',
    'Cloud Computing Basics'
  ];

  let courseCode = 1000;
  for (let i = 0; i < 40; i++) {
    const instructor = teacherIds[Math.floor(Math.random() * teacherIds.length)];
    courses.push({
      courseCode: `CS${courseCode}`,
      courseName: courseNames[i % courseNames.length] + (i > 10 ? ` - Lớp ${Math.floor(i / 10)}` : ''),
      description: `Khóa học chuyên sâu về ${courseNames[i % courseNames.length].toLowerCase()}`,
      credits: Math.floor(Math.random() * 3) + 2,
      department: departments[Math.floor(Math.random() * 4)],
      instructor: instructor,
      semester: semesters[Math.floor(Math.random() * 4)],
      campusOfferingLocation: campuses[Math.floor(Math.random() * 3)],
      status: Math.random() > 0.2 ? 'active' : 'draft'
    });
    courseCode++;
  }

  return courses;
};

const generateMaterials = (courseIds, userIds) => {
  const materials = [];
  const titles = [
    'Giáo trình môn học',
    'Slide bài giảng tuần 1',
    'Bài tập lập trình',
    'Đề thi cuối kỳ',
    'Tài liệu tham khảo',
    'Video hướng dẫn',
    'Mã nguồn ví dụ',
    'Danh sách công thức',
    'Hướng dẫn sử dụng công cụ',
    'Case study thực tế'
  ];

  const tags = [
    'backend', 'frontend', 'database', 'security', 'performance',
    'nodejs', 'mongodb', 'javascript', 'rest-api', 'distributed-systems'
  ];

  for (let i = 0; i < 300; i++) {
    const courseId = courseIds[Math.floor(Math.random() * courseIds.length)];
    const uploaderId = userIds[Math.floor(Math.random() * userIds.length)];

    materials.push({
      title: `${titles[i % titles.length]} - Phần ${Math.floor(i / 10) + 1}`,
      description: `Tài liệu học tập cho khóa học. Nội dung bao gồm lý thuyết và thực hành.`,
      course: courseId,
      uploader: uploaderId,
      fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
      fileUrl: `https://example.com/materials/file_${i}.pdf`,
      fileSize: Math.floor(Math.random() * 50000000) + 1000000,
      contentType: 'application/pdf',
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: [tags[Math.floor(Math.random() * tags.length)]],
      isPublished: true,
      viewCount: Math.floor(Math.random() * 500),
      downloadCount: Math.floor(Math.random() * 200),
      campus: campuses[Math.floor(Math.random() * 3)]
    });
  }

  return materials;
};

const generateActivities = (userIds, materialIds, courseIds) => {
  const activities = [];
  const actions = ['view', 'download', 'upload', 'update', 'delete'];

  for (let i = 0; i < 400; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));

    activities.push({
      user: userIds[Math.floor(Math.random() * userIds.length)],
      material: materialIds[Math.floor(Math.random() * materialIds.length)],
      course: courseIds[Math.floor(Math.random() * courseIds.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      actionDetails: {
        campus: campuses[Math.floor(Math.random() * 3)],
        timestamp: createdDate
      },
      duration: Math.floor(Math.random() * 3600),
      status: 'success',
      createdAt: createdDate
    });
  }

  return activities;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🧹 Xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Material.deleteMany({}),
      Activity.deleteMany({})
    ]);

    // Generate and save users
    console.log('👥 Tạo dữ liệu người dùng...');
    const usersData = generateUsers();
    const savedUsers = await User.insertMany(usersData);
    const userIds = savedUsers.map(u => u._id);
    console.log(`   ✓ Tạo ${savedUsers.length} người dùng`);

    // Generate and save courses
    console.log('📚 Tạo dữ liệu khóa học...');
    const coursesData = generateCourses(userIds.slice(1, 16)); // 15 teachers
    const savedCourses = await Course.insertMany(coursesData);
    const courseIds = savedCourses.map(c => c._id);
    console.log(`   ✓ Tạo ${savedCourses.length} khóa học`);

    // Generate and save materials
    console.log('📄 Tạo dữ liệu tài liệu...');
    const materialsData = generateMaterials(courseIds, userIds);
    const savedMaterials = await Material.insertMany(materialsData);
    const materialIds = savedMaterials.map(m => m._id);
    console.log(`   ✓ Tạo ${savedMaterials.length} tài liệu`);

    // Generate and save activities
    console.log('📊 Tạo dữ liệu hoạt động...');
    const activitiesData = generateActivities(userIds, materialIds, courseIds);
    const savedActivities = await Activity.insertMany(activitiesData);
    console.log(`   ✓ Tạo ${savedActivities.length} hoạt động`);

    // Create indexes
    console.log('🔍 Tạo chỉ mục...');
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ username: 1 });
    await Material.collection.createIndex({ title: 'text', description: 'text' });
    await Activity.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
    console.log('   ✓ Chỉ mục đã được tạo');

    console.log('\n✅ Dữ liệu mẫu đã được tạo thành công!');
    console.log('\n📋 Thông tin tài khoản mẫu:');
    console.log('   Admin:');
    console.log('     - Email: admin@hnue.edu.vn');
    console.log('     - Password: Admin@123456');
    console.log('\n   Teacher:');
    console.log('     - Email: teacher1@hnue.edu.vn');
    console.log('     - Password: Teacher@123456');
    console.log('\n   Student:');
    console.log('     - Email: student001@student.hnue.edu.vn');
    console.log('     - Password: Student@123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu:', error.message);
    process.exit(1);
  }
};

seedDatabase();

