# SmartLearn API - Learning Management System

Hệ thống quản lý học liệu phân tán với MongoDB, Node.js, JWT Authentication, và Swagger Documentation.

## 🎯 Tính năng chính

- ✅ **Xác thực & Phân quyền**: JWT token, bcrypt password hashing, RBAC (Admin/Teacher/Student)
- ✅ **Quản lý học liệu**: Thêm, sửa, xóa, tìm kiếm, lọc theo khóa học
- ✅ **Ghi log hoạt động**: Tất cả hoạt động được ghi vào collection Activities
- ✅ **Thống kê**: Lượt tải, lượt xem, hoạt động theo ngày/người dùng
- ✅ **API Documentation**: Swagger UI tương tác
- ✅ **MongoDB Optimization**: Index, Text search, TTL collections
- ✅ **Hỗ trợ phân tán**: Tối ưu cho nhiều cơ sở (Hà Nội, Đà Nẵng, TP. Hồ Chí Minh)

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.0
- npm hoặc yarn

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` (đã có sẵn):

```
MONGO_URI=mongodb://localhost:27017/smartlearn
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345!@#
JWT_EXPIRE=7d
PORT=3000
NODE_ENV=development
```

### 3. Khởi chạy MongoDB

**Sử dụng Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:5.0
```

**Hoặc cài đặt MongoDB local:**
https://docs.mongodb.com/manual/installation/

### 4. Tạo dữ liệu mẫu

```bash
npm run seed
```

Lệnh này sẽ tạo:
- 1 Admin
- 15 Teachers
- 250+ Students
- 40 Courses
- 300+ Materials
- 400+ Activities

### 5. Khởi chạy server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên: **http://localhost:3000**

## 📚 API Documentation

Truy cập Swagger UI: **http://localhost:3000/api/docs**

### 1️⃣ Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Đăng ký người dùng mới

```json
{
  "username": "student01",
  "email": "student01@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "department": "Công nghệ thông tin",
  "campus": "Hà Nội"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "student01",
    "email": "student01@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "student"
  }
}
```

#### POST `/api/auth/login`
Đăng nhập

```json
{
  "email": "student01@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### GET `/api/auth/me`
Lấy thông tin người dùng hiện tại

**Headers:**
```
Authorization: Bearer <token>
```

---

### 2️⃣ Materials Routes (`/api/materials`)

#### GET `/api/materials`
Lấy danh sách tài liệu (với lọc, tìm kiếm, phân trang)

**Query parameters:**
- `course` - ID khóa học
- `category` - lecture, assignment, exam, reference, resource
- `fileType` - pdf, doc, docx, ppt, pptx, video, image
- `campus` - Hà Nội, Đà Nẵng, TP. Hồ Chí Minh
- `search` - Từ khóa tìm kiếm
- `sort` - newest, oldest, mostViewed, mostDownloaded
- `page` - Số trang (default: 1)
- `limit` - Số bản ghi/trang (default: 10)

**Example:**
```
GET /api/materials?course=507f1f77bcf86cd799439011&category=lecture&page=1&limit=20
```

#### GET `/api/materials/:id`
Lấy chi tiết tài liệu và tăng viewCount

#### POST `/api/materials`
Tạo tài liệu mới (yêu cầu: Teacher hoặc Admin)

```json
{
  "title": "Slide bài giảng",
  "description": "Nội dung bài giảng",
  "course": "507f1f77bcf86cd799439011",
  "fileType": "pdf",
  "fileUrl": "https://example.com/file.pdf",
  "fileSize": 5000000,
  "category": "lecture",
  "tags": ["nodejs", "backend"]
}
```

#### PUT `/api/materials/:id`
Cập nhật tài liệu (yêu cầu: chủ sở hữu hoặc Admin)

#### DELETE `/api/materials/:id`
Xóa tài liệu (yêu cầu: chủ sở hữu hoặc Admin)

#### POST `/api/materials/:id/download`
Ghi nhận lượt tải

---

### 3️⃣ Courses Routes (`/api/courses`)

#### GET `/api/courses`
Lấy danh sách khóa học

**Query parameters:**
- `department` - Tên khoa
- `campus` - Cơ sở
- `status` - draft, active, completed, archived
- `page`, `limit` - Phân trang

#### GET `/api/courses/:id`
Lấy chi tiết khóa học cùng danh sách tài liệu

#### POST `/api/courses`
Tạo khóa học mới (yêu cầu: Teacher hoặc Admin)

```json
{
  "courseCode": "CS1001",
  "courseName": "Cơ sở dữ liệu NoSQL",
  "description": "Tìm hiểu MongoDB và hệ thống phân tán",
  "credits": 3,
  "department": "Công nghệ thông tin",
  "semester": "20241",
  "campusOfferingLocation": "Hà Nội"
}
```

#### PUT `/api/courses/:id`
Cập nhật khóa học

#### POST `/api/courses/:id/enroll`
Học viên đăng ký khóa học

---

### 4️⃣ Statistics Routes (`/api/statistics`)

#### GET `/api/statistics/dashboard`
Dashboard tổng hợp: tổng số người dùng, khóa học, tài liệu, hoạt động

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 266,
      "totalCourses": 40,
      "totalMaterials": 300,
      "totalActivities": 400,
      "recentActivitiesLastWeek": 85
    },
    "topMaterials": [ ... ],
    "activitiesByAction": [ ... ]
  }
}
```

#### GET `/api/statistics/materials`
Thống kê tài liệu: views, downloads, top materials

**Query parameters:**
- `course` - Lọc theo khóa học
- `startDate`, `endDate` - Khoảng thời gian

#### GET `/api/statistics/activities`
Thống kê hoạt động theo ngày/người dùng/hành động

**Query parameters:**
- `groupBy` - day, user, action (default: day)
- `startDate`, `endDate`
- `campus`

#### GET `/api/statistics/users`
Thống kê người dùng theo vai trò và cơ sở

---

## 🔐 Xác thực

Tất cả API endpoints (trừ `/api/auth/register` và `/api/auth/login`) yêu cầu JWT token trong header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👤 Vai trò và quyền hạn (RBAC)

| Vai trò | Quyền |
|---------|-------|
| **Admin** | Toàn quyền: quản lý tất cả người dùng, khóa học, tài liệu, xem thống kê |
| **Teacher** | Tạo/chỉnh sửa khóa học của mình, quản lý tài liệu của mình, xem thống kê |
| **Student** | Xem khóa học, tải tài liệu, đăng ký khóa học |

## 🎯 MongoDB Collections & Indexes

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique, index),
  password: String (hashed with bcrypt),
  fullName: String,
  role: "admin" | "teacher" | "student",
  department: String,
  campus: String (index),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }`
- `{ username: 1 }`
- `{ campus: 1 }`
- `{ role: 1 }`

### Courses Collection
```javascript
{
  _id: ObjectId,
  courseCode: String (unique, index),
  courseName: String,
  description: String,
  credits: Number,
  department: String (index),
  instructor: ObjectId (ref: User, index),
  students: [ObjectId] (ref: User),
  semester: String,
  startDate: Date,
  endDate: Date,
  campusOfferingLocation: String (index),
  status: "draft" | "active" | "completed" | "archived" (index),
  totalMaterials: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ courseCode: 1 }`
- `{ instructor: 1 }`
- `{ department: 1 }`
- `{ campusOfferingLocation: 1 }`
- `{ status: 1 }`

### Materials Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Course, index),
  uploader: ObjectId (ref: User, index),
  fileType: "pdf" | "doc" | "docx" | "ppt" | "pptx" | "video" | "image" | "other",
  fileUrl: String,
  fileSize: Number (bytes),
  contentType: String,
  category: "lecture" | "assignment" | "exam" | "reference" | "resource" (index),
  tags: [String],
  isPublished: Boolean,
  viewCount: Number,
  downloadCount: Number,
  campus: String (index),
  createdAt: Date (index),
  updatedAt: Date
}
```

**Indexes:**
- `{ course: 1 }`
- `{ uploader: 1 }`
- `{ campus: 1 }`
- `{ category: 1 }`
- `{ fileType: 1 }`
- Text search: `{ title: 'text', description: 'text', tags: 'text' }`
- `{ createdAt: -1 }`

### Activities Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  material: ObjectId (ref: Material),
  course: ObjectId (ref: Course),
  action: "view" | "download" | "upload" | "update" | "delete",
  actionDetails: {
    ip: String,
    userAgent: String,
    campus: String,
    timestamp: Date
  },
  duration: Number (seconds),
  status: "success" | "failed",
  createdAt: Date (TTL: 90 days auto-delete)
}
```

**Indexes:**
- `{ user: 1, createdAt: -1 }`
- `{ material: 1 }`
- `{ course: 1 }`
- `{ action: 1 }`
- `{ actionDetails.campus: 1 }`
- `{ createdAt: -1 }` (TTL: 7776000 seconds = 90 days)

---

## 🧪 Ví dụ sử dụng API

### 1. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@hnue.edu.vn",
    "password": "Teacher@123456"
  }'
```

### 2. Tạo khóa học

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "courseCode": "CS2024",
    "courseName": "Thiết kế hệ thống phân tán",
    "credits": 3,
    "department": "Công nghệ thông tin",
    "semester": "20241"
  }'
```

### 3. Tạo tài liệu

```bash
curl -X POST http://localhost:3000/api/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Slide bài giảng MongoDB",
    "course": "<COURSE_ID>",
    "fileType": "pdf",
    "fileUrl": "https://example.com/mongodb.pdf",
    "fileSize": 5000000,
    "category": "lecture"
  }'
```

### 4. Tìm kiếm tài liệu

```bash
curl -X GET "http://localhost:3000/api/materials?search=mongodb&category=lecture&page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Xem thống kê

```bash
curl -X GET http://localhost:3000/api/statistics/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🏗️ Cấu trúc dự án

```
khoa-luan-su-pham/
├── index.js                          # Entry point
├── .env                              # Environment variables
├── package.json                      # Dependencies
├── README.md                         # Documentation
│
├── src/
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── swagger.js               # Swagger configuration
│   │
│   ├── schemas/
│   │   ├── User.js                  # User model
│   │   ├── Course.js                # Course model
│   │   ├── Material.js              # Material model
│   │   └── Activity.js              # Activity model (logging)
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication & RBAC
│   │   ├── errorHandler.js          # Error handling
│   │   └── activityLogger.js        # Activity logging
│   │
│   └── routes/
│       ├── auth.js                  # Authentication endpoints
│       ├── materials.js             # Materials CRUD endpoints
│       ├── courses.js               # Courses CRUD endpoints
│       └── statistics.js            # Statistics aggregation endpoints
│
└── scripts/
    └── seedData.js                  # Database seeding script
```

## 📊 Aggregation Pipeline Examples

### Top 10 Most Downloaded Materials

```javascript
db.materials.aggregate([
  { $match: { isPublished: true } },
  { $sort: { downloadCount: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseInfo"
    }
  }
])
```

### Activities by Date

```javascript
db.activities.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
      actions: { $push: "$action" }
    }
  },
  { $sort: { _id: -1 } }
])
```

### User Activity Summary

```javascript
db.activities.aggregate([
  {
    $group: {
      _id: "$user",
      totalActions: { $sum: 1 },
      views: {
        $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] }
      },
      downloads: {
        $sum: { $cond: [{ $eq: ["$action", "download"] }, 1, 0] }
      }
    }
  },
  { $sort: { totalActions: -1 } },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

---

## 🔒 Bảo mật

- ✅ **Password Hashing**: Sử dụng bcryptjs (salt rounds: 10)
- ✅ **JWT Token**: Hết hạn sau 7 ngày
- ✅ **RBAC**: Role-based access control (Admin/Teacher/Student)
- ✅ **Input Validation**: Mongoose schema validation
- ✅ **SQL/NoSQL Injection Protection**: Mongoose queries
- ✅ **CORS**: Cấu hình CORS an toàn

---

## 📈 Performance Optimization

- ✅ **Indexes**: Tất cả collection đều có indexes trên fields tìm kiếm thường xuyên
- ✅ **Text Search**: Full-text search index trên Materials
- ✅ **TTL Indexes**: Activities tự động xóa sau 90 ngày
- ✅ **Pagination**: Tất cả list endpoints hỗ trợ phân trang
- ✅ **Aggregation Pipeline**: Sử dụng MongoDB's native aggregation
- ✅ **Projection**: Chỉ lấy fields cần thiết

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Đảm bảo MongoDB đang chạy
```bash
docker start mongodb
# hoặc
mongod
```

### JWT Token Invalid
```
Token không hợp lệ hoặc đã hết hạn
```
**Solution**: Đăng nhập lại để lấy token mới

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Đổi PORT trong .env hoặc kill process
```bash
lsof -i :3000
kill -9 <PID>
```

---

## 📝 License

Dự án học tập - Trường Đại học Sư phạm Hà Nội

---

## 📞 Hỗ trợ

Liên hệ: support@hnue.edu.vn

---

**Last Updated**: December 2024

