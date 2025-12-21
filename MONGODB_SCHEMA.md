# 📊 MongoDB Data Model Documentation

Tài liệu chi tiết về thiết kế cơ sở dữ liệu NoSQL cho SmartLearn

---

## 🎯 Tổng quan

**Mô hình dữ liệu:** Phân tán đa chi nhánh (Hà Nội, Đà Nẵng, TP. Hồ Chí Minh)

**Số lượng collections:** 4 (Users, Courses, Materials, Activities)

**Chiến lược sharding:** Theo `campus` field

**Chiến lược replication:** Primary-Secondary model (tối thiểu 3 nodes)

---

## 📋 Chi tiết Collections

### 1. Users Collection

**Mục đích:** Lưu trữ thông tin người dùng (Giảng viên, Học viên, Admin)

**Schema:**
```javascript
{
  _id: ObjectId,                    // ID duy nhất
  username: String,                 // Tên đăng nhập (unique)
  email: String,                    // Email (unique)
  password: String,                 // Mật khẩu (bcrypt hashed)
  fullName: String,                 // Tên đầy đủ
  role: String,                     // "admin" | "teacher" | "student"
  department: String,               // "Công nghệ thông tin" | "Sư phạm" | ...
  campus: String,                   // "Hà Nội" | "Đà Nẵng" | "TP. Hồ Chí Minh"
  isActive: Boolean,                // Trạng thái hoạt động
  lastLogin: Date,                  // Lần đăng nhập cuối
  createdAt: Date,                  // Ngày tạo
  updatedAt: Date                   // Ngày cập nhật cuối
}
```

**Ví dụ Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "student001",
  "email": "student001@student.hnue.edu.vn",
  "password": "$2a$10$...",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "department": "Công nghệ thông tin",
  "campus": "Hà Nội",
  "isActive": true,
  "lastLogin": ISODate("2024-12-21T10:30:00Z"),
  "createdAt": ISODate("2024-01-15T08:00:00Z"),
  "updatedAt": ISODate("2024-12-21T10:30:00Z")
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 })                    // Unique index
db.users.createIndex({ username: 1 })                 // Unique index
db.users.createIndex({ campus: 1 })                   // Shard key
db.users.createIndex({ role: 1 })                     // Lọc theo vai trò
```

**Lượng bản ghi:** ~266 (1 admin + 15 teachers + 250 students)

---

### 2. Courses Collection

**Mục đích:** Lưu trữ thông tin khóa học/môn học

**Schema:**
```javascript
{
  _id: ObjectId,                         // ID duy nhất
  courseCode: String,                    // Mã khóa học (unique)
  courseName: String,                    // Tên khóa học
  description: String,                   // Mô tả
  credits: Number,                       // Số tín chỉ (1-4)
  department: String,                    // Khoa/Bộ môn
  instructor: ObjectId,                  // Ref: User (giảng viên)
  students: [ObjectId],                  // Ref: User (học viên đăng ký)
  semester: String,                      // Kỳ học (20231, 20232, 20241, ...)
  startDate: Date,                       // Ngày bắt đầu
  endDate: Date,                         // Ngày kết thúc
  campusOfferingLocation: String,        // Cơ sở đào tạo
  status: String,                        // "draft" | "active" | "completed" | "archived"
  totalMaterials: Number,                // Tổng số tài liệu
  createdAt: Date,
  updatedAt: Date
}
```

**Ví dụ Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "courseCode": "CS1001",
  "courseName": "Cơ sở dữ liệu NoSQL",
  "description": "Tìm hiểu MongoDB và hệ thống phân tán",
  "credits": 3,
  "department": "Công nghệ thông tin",
  "instructor": ObjectId("507f1f77bcf86cd799439011"),
  "students": [
    ObjectId("507f1f77bcf86cd799439013"),
    ObjectId("507f1f77bcf86cd799439014")
  ],
  "semester": "20241",
  "startDate": ISODate("2024-09-01T00:00:00Z"),
  "endDate": ISODate("2024-12-30T00:00:00Z"),
  "campusOfferingLocation": "Hà Nội",
  "status": "active",
  "totalMaterials": 15,
  "createdAt": ISODate("2024-08-01T00:00:00Z"),
  "updatedAt": ISODate("2024-12-21T00:00:00Z")
}
```

**Indexes:**
```javascript
db.courses.createIndex({ courseCode: 1 })            // Unique index
db.courses.createIndex({ instructor: 1 })            // Tìm khóa học của GV
db.courses.createIndex({ department: 1 })            // Lọc theo khoa
db.courses.createIndex({ campusOfferingLocation: 1 }) // Shard key
db.courses.createIndex({ status: 1 })                // Lọc theo trạng thái
```

**Lượng bản ghi:** ~40

**Quan hệ:**
- `instructor` → Users (một GV nhiều khóa học)
- `students` → Users (một khóa học nhiều học viên)

---

### 3. Materials Collection

**Mục đích:** Lưu trữ thông tin tài liệu/học liệu

**Schema:**
```javascript
{
  _id: ObjectId,                    // ID duy nhất
  title: String,                    // Tiêu đề tài liệu
  description: String,              // Mô tả
  course: ObjectId,                 // Ref: Course (khóa học)
  uploader: ObjectId,               // Ref: User (người upload)
  fileType: String,                 // "pdf" | "doc" | "docx" | "ppt" | ...
  fileUrl: String,                  // URL tải file
  fileSize: Number,                 // Dung lượng (bytes)
  contentType: String,              // MIME type
  category: String,                 // "lecture" | "assignment" | "exam" | ...
  tags: [String],                   // Tags để tìm kiếm
  isPublished: Boolean,             // Trạng thái công khai
  viewCount: Number,                // Lượt xem
  downloadCount: Number,            // Lượt tải
  campus: String,                   // Cơ sở (sharding key)
  createdAt: Date,
  updatedAt: Date
}
```

**Ví dụ Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439020"),
  "title": "Slide bài giảng - Giới thiệu MongoDB",
  "description": "Các slide về MongoDB fundamentals",
  "course": ObjectId("507f1f77bcf86cd799439012"),
  "uploader": ObjectId("507f1f77bcf86cd799439011"),
  "fileType": "pdf",
  "fileUrl": "https://s3.example.com/materials/mongodb-intro.pdf",
  "fileSize": 5000000,
  "contentType": "application/pdf",
  "category": "lecture",
  "tags": ["mongodb", "nosql", "database"],
  "isPublished": true,
  "viewCount": 125,
  "downloadCount": 68,
  "campus": "Hà Nội",
  "createdAt": ISODate("2024-09-05T10:00:00Z"),
  "updatedAt": ISODate("2024-12-21T10:00:00Z")
}
```

**Indexes:**
```javascript
db.materials.createIndex({ course: 1 })              // Tìm tài liệu theo khóa học
db.materials.createIndex({ uploader: 1 })            // Tìm tài liệu của GV
db.materials.createIndex({ campus: 1 })              // Shard key
db.materials.createIndex({ category: 1 })            // Lọc theo danh mục
db.materials.createIndex({ fileType: 1 })            // Lọc theo loại file
// Text search
db.materials.createIndex({ 
  title: "text", 
  description: "text", 
  tags: "text" 
})
db.materials.createIndex({ createdAt: -1 })          // Sắp xếp theo ngày
```

**Lượng bản ghi:** ~300

**Quan hệ:**
- `course` → Courses (một khóa học nhiều tài liệu)
- `uploader` → Users (một GV nhiều tài liệu)

---

### 4. Activities Collection

**Mục đích:** Ghi log hoạt động của người dùng (view, download, upload, update, delete)

**Schema:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,                   // Ref: User (người dùng)
  material: ObjectId,               // Ref: Material (tài liệu)
  course: ObjectId,                 // Ref: Course (khóa học)
  action: String,                   // "view" | "download" | "upload" | "update" | "delete"
  actionDetails: {
    ip: String,                     // Địa chỉ IP
    userAgent: String,              // User Agent
    campus: String,                 // Cơ sở (sharding key)
    timestamp: Date                 // Thời gian hành động
  },
  duration: Number,                 // Thời gian xem (giây)
  status: String,                   // "success" | "failed"
  createdAt: Date                   // TTL: 90 ngày
}
```

**Ví dụ Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439030"),
  "user": ObjectId("507f1f77bcf86cd799439013"),
  "material": ObjectId("507f1f77bcf86cd799439020"),
  "course": ObjectId("507f1f77bcf86cd799439012"),
  "action": "download",
  "actionDetails": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "campus": "Hà Nội",
    "timestamp": ISODate("2024-12-21T14:30:00Z")
  },
  "duration": 45,
  "status": "success",
  "createdAt": ISODate("2024-12-21T14:30:00Z")
}
```

**Indexes:**
```javascript
db.activities.createIndex({ user: 1, createdAt: -1 })       // Lịch sử hoạt động của user
db.activities.createIndex({ material: 1 })                  // Hoạt động trên tài liệu
db.activities.createIndex({ course: 1 })                    // Hoạt động trên khóa học
db.activities.createIndex({ action: 1 })                    // Lọc theo hành động
db.activities.createIndex({ "actionDetails.campus": 1 })    // Shard key
// TTL Index (Auto-delete sau 90 ngày)
db.activities.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })
```

**Lượng bản ghi:** ~400

**Quan hệ:**
- `user` → Users
- `material` → Materials
- `course` → Courses

---

## 🔑 Chiến lược Sharding

### Shard Key

**Shard key được chọn:** `campus` field

**Lý do:**
1. ✅ Phân tán đều dữ liệu giữa 3 cơ sở
2. ✅ Hỗ trợ query locality (truy vấn local là nhanh hơn)
3. ✅ Giảm cross-shard query
4. ✅ Tính cardinality cao (3 giá trị nhưng phân tán tốt)

**Áp dụng:**
```javascript
// Sharding cho Users
sh.shardCollection("smartlearn.users", { campus: 1 })

// Sharding cho Courses
sh.shardCollection("smartlearn.courses", { campusOfferingLocation: 1 })

// Sharding cho Materials
sh.shardCollection("smartlearn.materials", { campus: 1 })

// Sharding cho Activities
sh.shardCollection("smartlearn.activities", { "actionDetails.campus": 1 })
```

### Chunk Distribution

```
Shard 1 (Hà Nội):
- Users: ~90 documents
- Courses: ~15 documents
- Materials: ~100 documents
- Activities: ~140 documents

Shard 2 (Đà Nẵng):
- Users: ~88 documents
- Courses: ~13 documents
- Materials: ~100 documents
- Activities: ~130 documents

Shard 3 (TP. Hồ Chí Minh):
- Users: ~88 documents
- Courses: ~12 documents
- Materials: ~100 documents
- Activities: ~130 documents
```

---

## 🔍 Truy vấn tối ưu

### 1. Tìm kiếm tài liệu theo từ khóa

```javascript
db.materials.find({
  $text: { $search: "mongodb database" },
  isPublished: true
}).limit(10)

// Hoặc sử dụng aggregation
db.materials.aggregate([
  {
    $match: {
      $text: { $search: "mongodb" },
      isPublished: true
    }
  },
  {
    $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseInfo"
    }
  },
  { $limit: 10 }
])
```

### 2. Top 10 tài liệu được xem nhiều nhất

```javascript
db.materials.aggregate([
  { $match: { isPublished: true } },
  { $sort: { viewCount: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "users",
      localField: "uploader",
      foreignField: "_id",
      as: "uploaderInfo"
    }
  },
  {
    $project: {
      _id: 1,
      title: 1,
      viewCount: 1,
      downloadCount: 1,
      "uploaderInfo.fullName": 1
    }
  }
])
```

### 3. Thống kê hoạt động theo ngày

```javascript
db.activities.aggregate([
  {
    $match: {
      createdAt: {
        $gte: ISODate("2024-12-01"),
        $lte: ISODate("2024-12-31")
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      count: { $sum: 1 },
      actions: { $push: "$action" }
    }
  },
  { $sort: { _id: -1 } }
])
```

### 4. Lấy khóa học của một giảng viên

```javascript
db.courses.find({
  instructor: ObjectId("507f1f77bcf86cd799439011"),
  status: "active"
}).sort({ createdAt: -1 })
```

### 5. Lịch sử hoạt động của một người dùng

```javascript
db.activities.find({
  user: ObjectId("507f1f77bcf86cd799439013")
})
  .sort({ createdAt: -1 })
  .limit(50)
```

### 6. Đếm học viên trong một khóa học

```javascript
db.courses.findOne(
  { _id: ObjectId("507f1f77bcf86cd799439012") },
  { students: 1 }
).students.length

// Hoặc
db.courses.aggregate([
  { $match: { _id: ObjectId("507f1f77bcf86cd799439012") } },
  { $project: { studentCount: { $size: "$students" } } }
])
```

---

## 📈 Thống kê & Aggregation Pipelines

### Dashboard Summary

```javascript
db.aggregate([
  // Tổng users
  {
    $facet: {
      totalUsers: [
        { $match: { _id: { $exists: true } } },
        { $count: "count" }
      ],
      totalCourses: [
        { $match: { } },
        { $count: "count" }
      ]
    }
  }
])
```

### Hoạt động theo vai trò người dùng

```javascript
db.activities.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  { $unwind: "$userInfo" },
  {
    $group: {
      _id: "$userInfo.role",
      totalActions: { $sum: 1 },
      views: { $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] } },
      downloads: { $sum: { $cond: [{ $eq: ["$action", "download"] }, 1, 0] } }
    }
  }
])
```

### Phân phối dữ liệu theo cơ sở

```javascript
db.materials.aggregate([
  {
    $group: {
      _id: "$campus",
      count: { $sum: 1 },
      totalSize: { $sum: "$fileSize" }
    }
  }
])
```

---

## ⚡ Performance Tips

1. **Sử dụng indexes** cho tất cả query fields
2. **Tránh $lookup** trên nhiều collections
3. **Sử dụng aggregation pipeline** thay vì application-level processing
4. **Projection** để giảm dữ liệu truyền qua mạng
5. **Batch operations** khi có nhiều writes

### Explain Query

```javascript
// Xem execution plan
db.materials.explain("executionStats").find({
  category: "lecture",
  campus: "Hà Nội"
})

// Kiểm tra index được sử dụng
db.materials.explain().find({ title: "MongoDB" })
```

---

## 🔒 Bảo mật Dữ liệu

1. **Encryption at rest**: Enable MongoDB encryption
2. **Encryption in transit**: Use TLS/SSL
3. **Authentication**: Sử dụng username/password strong
4. **Authorization**: Role-based access control (RBAC)
5. **Audit logging**: Enable audit log

---

## 📊 Dataset Statistics

| Collection | Documents | Avg Size | Total Size |
|-----------|-----------|----------|-----------|
| Users | 266 | ~500 bytes | ~133 KB |
| Courses | 40 | ~1.5 KB | ~60 KB |
| Materials | 300 | ~2 KB | ~600 KB |
| Activities | 400 | ~800 bytes | ~320 KB |
| **Total** | **1,006** | - | **~1.1 MB** |

---

Last Updated: December 2024

