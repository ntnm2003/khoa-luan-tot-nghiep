# 📊 Phân Tích Mối Quan Hệ Giữa Các Collection và Mô Hình Truy Vấn Tối Ưu

**Hệ thống: SmartLearn - Quản lý Học liệu Phân tán**  
**Ngày tạo: December 2025**  
**Dành cho: Báo cáo Bài tập Cuối khóa**

---

## 1️⃣ PHÂN TÍCH MỐI QUAN HỆ GIỮA CÁC COLLECTION

### 1.1 Sơ đồ Mối Quan Hệ (ER Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SmartLearn Database Relations                     │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │    USERS     │
                            ├──────────────┤
                            │ _id (PK)     │
                            │ username     │
                            │ email        │
                            │ password     │
                            │ fullName     │
                            │ role         │◄──────┐
                            │ department   │       │
                            │ campus       │       │
                            └──────┬───────┘       │
                                   │              │ (1:N)
                    ┌──────────────┼──────────────┐
                    │ (1:N)        │ (1:N)        │ (1:N)
                    ▼              ▼              ▼
            ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
            │   COURSES    │  │  MATERIALS   │ │  ACTIVITIES  │
            ├──────────────┤  ├──────────────┤ ├──────────────┤
            │ _id (PK)     │  │ _id (PK)     │ │ _id (PK)     │
            │ courseCode   │  │ title        │ │ user (FK)    │
            │ courseName   │  │ course (FK)◄─┤ │ material(FK) │
            │ instructor───┤  │ uploader(FK) │ │ course (FK)  │
            │ students[FK] │  │ fileType     │ │ action       │
            │ status       │  │ viewCount    │ │ timestamp    │
            │ campus       │  │ downloadCnt  │ │ campus       │
            └──────────────┘  │ campus       │ └──────────────┘
                              └──────────────┘

Legend:
─── : One-to-Many Relationship (1:N)
PK  : Primary Key
FK  : Foreign Key
```

### 1.2 Chi Tiết Mối Quan Hệ

#### **Quan hệ 1: Users → Courses (Giảng viên tạo khóa học)**

```javascript
// Giảng viên (User.role = "teacher")
//   │
//   └──> instructor (Courses.instructor)
//        Một giảng viên có thể dạy nhiều khóa học
//        Mối quan hệ: 1:N

// MongoDB Query
db.courses.find({ instructor: ObjectId("user_id") })
```

**Đặc điểm:**
- Một giảng viên có thể tạo nhiều khóa học
- Mỗi khóa học chỉ có một giảng viên chính
- Mối quan hệ không bắt buộc (null instructor có thể được phép tùy chỉnh)

---

#### **Quan hệ 2: Courses → Students (Học viên đăng ký khóa học)**

```javascript
// Khóa học (Courses)
//   │
//   └──> students[] (Array of ObjectId references)
//        Một khóa học có nhiều học viên
//        Một học viên có thể đăng ký nhiều khóa học
//        Mối quan hệ: N:M (Many-to-Many)

// MongoDB Query - Tìm tất cả khóa học của một học viên
db.courses.find({ students: ObjectId("student_id") })

// MongoDB Query - Tìm tất cả học viên trong một khóa học
db.courses.aggregate([
  { $match: { _id: ObjectId("course_id") } },
  { $lookup: {
      from: "users",
      localField: "students",
      foreignField: "_id",
      as: "studentDetails"
    }
  }
])
```

**Đặc điểm:**
- Mối quan hệ Many-to-Many
- Lưu trữ dưới dạng array trong Courses
- Cách này phù hợp vì số học viên không quá lớn (~250)

---

#### **Quan hệ 3: Courses → Materials (Khóa học chứa tài liệu)**

```javascript
// Khóa học (Courses)
//   │
//   └──> Materials.course (FK)
//        Một khóa học có nhiều tài liệu
//        Mối quan hệ: 1:N

// MongoDB Query - Tìm tất cả tài liệu của một khóa học
db.materials.find({ course: ObjectId("course_id") })

// Tối ưu: Denormalization - lưu totalMaterials trong Courses
db.courses.findOne({ _id: ObjectId("course_id") }, { totalMaterials: 1 })
```

**Đặc điểm:**
- Một khóa học có thể chứa 0 đến nhiều tài liệu
- Mỗi tài liệu thuộc về đúng một khóa học
- Sử dụng denormalization (totalMaterials) để tránh aggregation khi list courses

---

#### **Quan hệ 4: Users → Materials (Người upload tài liệu)**

```javascript
// Giảng viên/Admin (User)
//   │
//   └──> Materials.uploader (FK)
//        Một người dùng có thể upload nhiều tài liệu
//        Mối quan hệ: 1:N

// MongoDB Query - Tìm tất cả tài liệu do một giảng viên upload
db.materials.find({ uploader: ObjectId("teacher_id") })
```

**Đặc điểm:**
- Chỉ giảng viên và admin mới có thể upload
- Một tài liệu chỉ có một uploader
- Sử dụng để kiểm soát quyền sửa/xóa

---

#### **Quan hệ 5: Activities (Ghi log hoạt động)**

```javascript
// Activities ghi lại tương tác của người dùng
// Quan hệ với 3 collection khác: Users, Materials, Courses

// Activities.user ──> Users._id
// Activities.material ──> Materials._id  
// Activities.course ──> Courses._id

// MongoDB Query - Lịch sử hoạt động của một học viên
db.activities.aggregate([
  { $match: { user: ObjectId("student_id") } },
  { $lookup: {
      from: "materials",
      localField: "material",
      foreignField: "_id",
      as: "materialDetails"
    }
  },
  { $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseDetails"
    }
  },
  { $sort: { createdAt: -1 } },
  { $limit: 50 }
])
```

**Đặc điểm:**
- Activities là collection tương đối độc lập
- Ghi lại mọi tương tác (view, download, upload, update, delete)
- Dữ liệu lịch sử, không cần update
- Sử dụng TTL index để tự động xóa sau 90 ngày

---

### 1.3 Ma Trận Mối Quan Hệ

| Từ Collection | Đến Collection | Kiểu | Cardinality | Cách Lưu |
|--------------|----------------|------|------------|---------|
| Users | Courses | FK | 1:N | instructor trong Courses |
| Courses | Users | Array FK | N:M | students[] array trong Courses |
| Courses | Materials | FK | 1:N | course FK trong Materials |
| Users | Materials | FK | 1:N | uploader FK trong Materials |
| Activities | Users | FK | N:1 | user FK trong Activities |
| Activities | Materials | FK | N:1 | material FK trong Activities |
| Activities | Courses | FK | N:1 | course FK trong Activities |

---

## 2️⃣ MÔ HÌNH TRUY VẤN TỐI ƯU

### 2.1 Chiến Lược Indexing

#### **A. Unique Indexes (Chỉ mục Duy Nhất)**

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
// Mục đích: Đảm bảo không có email/username trùng
// Hiệu năng: O(log n) cho login query

// Courses Collection
db.courses.createIndex({ courseCode: 1 }, { unique: true })
// Mục đích: Mã khóa học phải duy nhất
```

#### **B. Single Field Indexes (Chỉ mục Trường Đơn)**

```javascript
// Users Collection
db.users.createIndex({ campus: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ department: 1 })
// Mục đích: Tìm kiếm nhanh người dùng theo cơ sở/vai trò/khoa

// Courses Collection
db.courses.createIndex({ instructor: 1 })
db.courses.createIndex({ status: 1 })
db.courses.createIndex({ campusOfferingLocation: 1 })

// Materials Collection
db.materials.createIndex({ course: 1 })
db.materials.createIndex({ uploader: 1 })
db.materials.createIndex({ fileType: 1 })
db.materials.createIndex({ category: 1 })
db.materials.createIndex({ campus: 1 })

// Activities Collection
db.activities.createIndex({ user: 1 })
db.activities.createIndex({ material: 1 })
db.activities.createIndex({ course: 1 })
db.activities.createIndex({ action: 1 })
```

**Hiệu năng:**
- Truy vấn đơn giản: O(log n) thay vì O(n)
- Tìm kiếm 10k documents trong 1M records: ~13 comparisons (vs 500k avg scans)

#### **C. Composite Indexes (Chỉ mục Kết Hợp)**

```javascript
// Users + Campus (cho phép query locality)
db.users.createIndex({ campus: 1, role: 1 })
// Query: db.users.find({ campus: "Hà Nội", role: "student" })

// Courses + Department
db.courses.createIndex({ department: 1, status: 1 })
// Query: db.courses.find({ department: "CNTT", status: "active" })

// Materials + Course + Category
db.materials.createIndex({ course: 1, category: 1 })
// Query: db.materials.find({ course: ObjectId(...), category: "lecture" })

// Activities + User + Date (cho lịch sử hoạt động)
db.activities.createIndex({ user: 1, createdAt: -1 })
// Query: db.activities.find({ user: ObjectId(...) }).sort({ createdAt: -1 })
```

#### **D. Text Search Index (Chỉ mục Tìm Kiếm Văn Bản)**

```javascript
// Materials - Full-text search trên tiêu đề, mô tả, tags
db.materials.createIndex({
  title: "text",
  description: "text",
  tags: "text"
}, { default_language: "none" })

// Query: Tìm tài liệu về "MongoDB" hoặc "database"
db.materials.find({
  $text: { $search: "MongoDB database" }
})

// Query với weight (tiêu đề quan trọng hơn mô tả)
db.materials.createIndex({
  title: "text",
  description: "text",
  tags: "text"
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 3
  }
})
```

#### **E. TTL Index (Tự động xóa dữ liệu cũ)**

```javascript
// Activities - Tự động xóa records sau 90 ngày
db.activities.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 } // 90 days = 7776000 seconds
)

// Mục đích: 
// - Tiết kiệm storage
// - Giữ database llightweight
// - Duy trì chỉ thống kê gần đây
```

---

### 2.2 Sharding Strategy (Chiến Lược Phân chia Dữ Liệu)

#### **Shard Key: campus (Cơ sở đào tạo)**

**Lý do chọn campus:**
1. ✅ **Query Locality** - Các truy vấn thường yêu cầu dữ liệu từ một cơ sở
2. ✅ **Even Distribution** - 3 cơ sở → dữ liệu phân tán đều (mỗi ~33%)
3. ✅ **Growth Pattern** - Dữ liệu bên mỗi cơ sở phát triển độc lập
4. ✅ **Cardinality** - Đủ giá trị distinct (3 campuses)

**Không phù hợp:**
- ❌ user._id: Mỗi chunk quá nhỏ, quá nhiều splits
- ❌ course._id: Random distribution, mất query locality
- ❌ timetstamp: Mọi ghi được vào shard cuối, tạo hotspot

#### **Sharding Configuration**

```javascript
// 1. Enable sharding on database
sh.enableSharding("smartlearn")

// 2. Create shard key index
db.users.createIndex({ campus: 1 })
db.courses.createIndex({ campusOfferingLocation: 1 })
db.materials.createIndex({ campus: 1 })
db.activities.createIndex({ "actionDetails.campus": 1 })

// 3. Shard collections
sh.shardCollection("smartlearn.users", { campus: 1 })
sh.shardCollection("smartlearn.courses", { campusOfferingLocation: 1 })
sh.shardCollection("smartlearn.materials", { campus: 1 })
sh.shardCollection("smartlearn.activities", { "actionDetails.campus": 1 })

// 4. Monitor sharding status
sh.status()
db.printShardingStatus()
```

#### **Dữ liệu phân bố trên 3 Shard:**

```
Shard 1 (Hà Nội):
├─ Users: ~90 documents (campus = "Hà Nội")
├─ Courses: ~15 documents
├─ Materials: ~100 documents
└─ Activities: ~140 documents

Shard 2 (Đà Nẵng):
├─ Users: ~88 documents
├─ Courses: ~13 documents
├─ Materials: ~100 documents
└─ Activities: ~130 documents

Shard 3 (TP. Hồ Chí Minh):
├─ Users: ~88 documents
├─ Courses: ~12 documents
├─ Materials: ~100 documents
└─ Activities: ~130 documents
```

#### **Query Optimization với Sharding:**

```javascript
// 1. SCATTERED-GATHERED (yêu cầu tất cả shard)
// Không tốt - phải gộp kết quả từ 3 shard
db.materials.find({ category: "lecture" })

// 2. TARGETED (chỉ 1 shard được truy vấn)
// Tốt - chỉ Shard 1 được truy cập
db.materials.find({ campus: "Hà Nội", category: "lecture" })

// 3. AGGREGATION với shard key
// Tốt - phân bố tính toán
db.materials.aggregate([
  { $match: { campus: "Hà Nội" } },  // Filter: specific shard
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

---

### 2.3 Partition Key Strategy

#### **Logical Partitioning (Phân chia Luận lý)**

```javascript
// Partition 1: Data by Campus
{
  "campus": "Hà Nội",
  "data": { /* Hà Nội campus data */ }
}

// Partition 2: Data by Department (trong mỗi campus)
{
  "campus": "Hà Nội",
  "department": "CNTT",
  "data": { /* CNTT dept in Hà Nội */ }
}

// Partition 3: Data by Time (cho Activities)
{
  "campus": "Hà Nội",
  "month": "2024-12",
  "data": { /* Activities in Dec 2024 from Hà Nội */ }
}
```

#### **Cách Triển Khai:**

```javascript
// Tạo collection được partition
// (Sử dụng MongoDB 5.0+ partitioned collections)
db.createCollection("materials", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "hours"
  }
})

// Hoặc sử dụng manual partitioning với naming convention
// materials_hanoi, materials_danang, materials_hcm
```

---

### 2.4 Query Execution Plans (Kế Hoạch Thực Thi Truy Vấn)

#### **Query 1: Đăng nhập (Login)**

```javascript
// Query
db.users.findOne({ email: "admin@hnue.edu.vn" })

// Index sử dụng: { email: 1 }
// Execution Plan:
//   - Index scan: COLLSCAN → INDEX (email_1)
//   - Matching: 1 document found
//   - Return: user document
//   - Time complexity: O(log n)
//   - Ước lượng: 13 comparisons for 1M documents

// Explain output (简化):
{
  "executionStages": {
    "stage": "FETCH",
    "inputStage": {
      "stage": "IXSCAN",
      "index": "email_1",
      "keysExamined": 1,
      "docsExamined": 1
    }
  },
  "executionStats": {
    "executionStages": {
      "nReturned": 1,
      "executionTimeMillis": 5
    }
  }
}
```

#### **Query 2: Lấy tài liệu của khóa học**

```javascript
// Query
db.materials.find({ 
  course: ObjectId("507f1f77bcf86cd799439012"),
  category: "lecture"
}).sort({ createdAt: -1 }).limit(10)

// Indexes sử dụng: { course: 1, category: 1 }, { createdAt: -1 }
// Execution Plan:
//   1. Index Intersection: course_1_category_1
//   2. Sort: createdAt (từ memory hoặc index)
//   3. Limit: 10 documents
//   - Time complexity: O(log n) + O(10 log 10)

// Optimized explain:
{
  "executionStages": {
    "stage": "LIMIT",
    "inputStage": {
      "stage": "SORT",
      "inputStage": {
        "stage": "FETCH",
        "inputStage": {
          "stage": "IXSCAN",
          "index": "course_1_category_1"
        }
      }
    }
  }
}
```

#### **Query 3: Tìm kiếm Full-text**

```javascript
// Query
db.materials.find({
  $text: { $search: "MongoDB" },
  campus: "Hà Nội"
}).limit(20)

// Indexes sử dụng: { title: "text", description: "text" }, { campus: 1 }
// Execution Plan:
//   1. Text search: IXSCAN (text index)
//   2. Filter: campus = "Hà Nội"
//   3. Limit: 20 documents
//   - Time: O(indexed_results) + O(20)

// Score và ranking:
// Tài liệu có "MongoDB" trong title được rank cao hơn
```

---

### 2.5 Denormalization Strategy (Chiến Lược Khử Chuẩn Hóa)

#### **Mục đích của Denormalization:**
- Giảm $lookup operations
- Tăng tốc độ read
- Chấp nhận redundancy để đổi lấy performance

#### **Denormalization trong SmartLearn:**

```javascript
// 1. Courses collection - Lưu totalMaterials
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "courseName": "Cơ sở dữ liệu NoSQL",
  "totalMaterials": 15,  // Denormalized (cập nhật khi add/delete material)
  // ... other fields
}

// Benefit: 
// - Query list courses: không cần count($materials)
// - Time: O(1) vs O(n)

// Consistency: Cập nhật totalMaterials khi:
db.materials.insertOne({ course: course_id, ... })
db.courses.updateOne({ _id: course_id }, { $inc: { totalMaterials: 1 } })

// 2. Materials - Lưu courseInfo (nếu cần)
{
  "_id": ObjectId("507f1f77bcf86cd799439020"),
  "title": "Slide MongoDB",
  "course": ObjectId("507f1f77bcf86cd799439012"),
  "courseName": "Cơ sở dữ liệu NoSQL",  // Denormalized
  // ... other fields
}

// Benefit: Hiển thị courseName mà không cần lookup
```

---

## 3️⃣ CÁC TRUY VẤN MẪUVÀ AGGREGATION PIPELINES

### 3.1 Aggregation Pipeline Examples

#### **Pipeline 1: Thống kê lượt xem/tải theo tài liệu**

```javascript
db.materials.aggregate([
  // Stage 1: Match specific course
  { $match: { course: ObjectId("507f1f77bcf86cd799439012") } },
  
  // Stage 2: Sort by popularity
  { $sort: { viewCount: -1 } },
  
  // Stage 3: Limit top 10
  { $limit: 10 },
  
  // Stage 4: Lookup course info
  { $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseInfo"
    }
  },
  
  // Stage 5: Lookup uploader info
  { $lookup: {
      from: "users",
      localField: "uploader",
      foreignField: "_id",
      as: "uploaderInfo"
    }
  },
  
  // Stage 6: Project desired fields
  { $project: {
      title: 1,
      viewCount: 1,
      downloadCount: 1,
      "courseInfo.courseName": 1,
      "uploaderInfo.fullName": 1,
      popularity: { $add: ["$viewCount", "$downloadCount"] }
    }
  }
])

// Output:
[
  {
    title: "Slide MongoDB",
    viewCount: 125,
    downloadCount: 68,
    courseInfo: [{ courseName: "Cơ sở dữ liệu NoSQL" }],
    uploaderInfo: [{ fullName: "Giảng viên 1" }],
    popularity: 193
  },
  // ...
]
```

#### **Pipeline 2: Hoạt động của người dùng theo ngày**

```javascript
db.activities.aggregate([
  // Stage 1: Filter by date range
  { $match: {
      createdAt: {
        $gte: ISODate("2024-12-01"),
        $lt: ISODate("2024-12-31")
      }
    }
  },
  
  // Stage 2: Group by date and action
  { $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        action: "$action"
      },
      count: { $sum: 1 },
      users: { $addToSet: "$user" }
    }
  },
  
  // Stage 3: Sort by date
  { $sort: { "_id.date": -1 } },
  
  // Stage 4: Reshape output
  { $project: {
      _id: 0,
      date: "$_id.date",
      action: "$_id.action",
      count: 1,
      uniqueUsers: { $size: "$users" }
    }
  }
])

// Output:
[
  { date: "2024-12-21", action: "view", count: 45, uniqueUsers: 23 },
  { date: "2024-12-21", action: "download", count: 12, uniqueUsers: 8 },
  // ...
]
```

#### **Pipeline 3: Tài liệu được xem nhiều nhất bởi khoa**

```javascript
db.materials.aggregate([
  // Stage 1: Lookup course info
  { $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseInfo"
    }
  },
  
  // Stage 2: Unwind course array
  { $unwind: "$courseInfo" },
  
  // Stage 3: Group by department and get top materials
  { $group: {
      _id: "$courseInfo.department",
      topMaterials: {
        $push: {
          title: "$title",
          views: "$viewCount",
          materialId: "$_id"
        }
      },
      totalViews: { $sum: "$viewCount" },
      materialCount: { $sum: 1 }
    }
  },
  
  // Stage 4: Sort materials by views
  { $project: {
      _id: 1,
      topMaterials: {
        $slice: [
          { $sortArray: { input: "$topMaterials", sortBy: { views: -1 } } },
          5  // Top 5
        ]
      },
      totalViews: 1,
      materialCount: 1
    }
  }
])

// Output:
[
  {
    _id: "Công nghệ thông tin",
    topMaterials: [
      { title: "MongoDB Basics", views: 150, materialId: ObjectId(...) },
      // ... top 5 materials
    ],
    totalViews: 1250,
    materialCount: 95
  }
]
```

---

### 3.2 Map-Reduce Examples

#### **Map-Reduce 1: Tính tổng lượt tải theo người upload**

```javascript
db.materials.mapReduce(
  // MAP function
  function() {
    emit(this.uploader, this.downloadCount);
  },
  
  // REDUCE function
  function(uploader, downloads) {
    return Array.sum(downloads);
  },
  
  {
    out: { inline: 1 }
  }
)

// Output:
[
  { _id: ObjectId("teacher1"), value: 245 },
  { _id: ObjectId("teacher2"), value: 189 },
  { _id: ObjectId("teacher3"), value: 98 },
  // ...
]
```

#### **Map-Reduce 2: Tính hoạt động theo người dùng và hành động**

```javascript
db.activities.mapReduce(
  // MAP
  function() {
    emit(
      { user: this.user, action: this.action },
      1
    );
  },
  
  // REDUCE
  function(key, counts) {
    return Array.sum(counts);
  },
  
  {
    out: { inline: 1 },
    query: {
      createdAt: {
        $gte: ISODate("2024-12-01")
      }
    }
  }
)

// Output:
[
  { _id: { user: ObjectId(...), action: "view" }, value: 45 },
  { _id: { user: ObjectId(...), action: "download" }, value: 12 },
  // ...
]
```

---

## 4️⃣ BẢNG SO SÁNH: TRƯỚC VÀ SAU TỐI ƯU

| Truy Vấn | Trước (Không Index) | Sau (Có Index) | Cải Thiện |
|---------|-------------------|----------------|----------|
| Tìm user bằng email | O(n) = 500,000 scans | O(log n) = 10 | **50,000x** |
| List materials của course | O(n) = 300 scans | O(log 300) = 8 | **37x** |
| Full-text search | O(n) = 300 scans | O(indexed) = 5 | **60x** |
| Activities of user | O(n) = 400 scans | O(log 400) = 9 | **44x** |
| Shard query (mỗi shard) | 300 docs check | 10 docs check | **30x** |

---

## 5️⃣ KẾT LUẬN

### ✅ Điểm Mạnh của Mô Hình:
1. **Shard Key tối ưu** - campus cho phép query locality tốt
2. **Comprehensive Indexing** - Bao phủ tất cả trường tìm kiếm
3. **Denormalization chiến lược** - Giảm lookup operations
4. **TTL Indexes** - Tự động quản lý data retention
5. **Aggregation Pipelines** - Tính toán trên server (không application)

### ⚠️ Các Xem Xét:
1. **Consistency** - Phải xử lý batch updates cho denormalized fields
2. **Index Maintenance** - Mỗi insert/update phải update tất cả indexes
3. **Shard Balance** - Monitor chunk distribution để tránh hotspots
4. **Cardinality** - Shard key phải có cardinality đủ cao

### 🔮 Hướng Phát Triển:
1. Sử dụng **Materialized Views** cho complex aggregations
2. Implement **Change Streams** để sync denormalized data
3. Thêm **Read Replicas** từ secondary nodes
4. Cache layer (Redis) cho frequently accessed materials
5. Full-text search + Elasticsearch integration cho search nâng cao

---

**Tài liệu này là phần của Báo Cáo Bài Tập Cuối Khóa**  
**Trường Đại học Sư phạm Hà Nội - Tháng 12 năm 2025**

