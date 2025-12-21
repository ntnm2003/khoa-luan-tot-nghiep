# 📚 SmartLearn - Hệ thống Quản lý Học liệu Phân tán

![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.0+-green)
![Express](https://img.shields.io/badge/Express-v4.18+-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Swagger](https://img.shields.io/badge/Swagger-UI-red)

**Bài tập cuối khóa - Hệ thống cơ sở dữ liệu phân tán NoSQL**

Trường Đại học Sư phạm Hà Nội - TS. Nguyễn Duy Hải

---

## 🎯 Mục tiêu Dự án

Xây dựng một hệ thống quản lý học liệu hiện đại, phân tán trên 3 cơ sở đào tạo (Hà Nội, Đà Nẵng, TP. Hồ Chí Minh) với:

✅ **MongoDB NoSQL** - Cơ sở dữ liệu linh hoạt, mở rộng được  
✅ **Node.js API** - Backend nhanh, hiệu quả  
✅ **JWT Authentication** - Bảo mật quyền truy cập  
✅ **Swagger Documentation** - API tài liệu tương tác  
✅ **Dashboard** - Giao diện thống kê với Chart.js  
✅ **Distributed System** - Replication & Sharding  

---

## 📋 Tính năng chính

### 🔐 Xác thực & Phân quyền
- Đăng ký, đăng nhập với JWT token
- 3 vai trò: Admin, Teacher (Giảng viên), Student (Học viên)
- Mã hóa mật khẩu với bcryptjs
- Role-based access control (RBAC)

### 📚 Quản lý học liệu
- ✓ **Thêm** tài liệu (PDF, PowerPoint, Video, ...)
- ✓ **Sửa** thông tin tài liệu
- ✓ **Xóa** tài liệu
- ✓ **Tìm kiếm** theo từ khóa
- ✓ **Lọc** theo: khóa học, danh mục, loại file, cơ sở

### 📊 Thống kê hoạt động
- Ghi log tất cả hoạt động vào **Activities collection**
- Thống kê lượt xem/tải theo **ngày, người dùng, hành động**
- Top 10 tài liệu được xem nhiều nhất
- Biểu đồ hoạt động, phân phối người dùng

### 🎓 Quản lý khóa học
- Tạo khóa học
- Đăng ký học viên vào khóa học
- Xem danh sách tài liệu của khóa học
- Quản lý sinh viên và tài liệu

---

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi chạy MongoDB
```bash
# Sử dụng Docker (khuyến nghị)
docker run -d -p 27017:27017 --name mongodb mongo:5.0
```

### 3. Tạo dữ liệu mẫu
```bash
npm run seed
```

### 4. Chạy server
```bash
npm run dev
```

### 5. Truy cập
- **API Docs**: http://localhost:3000/api/docs
- **Dashboard**: http://localhost:3000/dashboard.html
- **Health Check**: http://localhost:3000/health

---

## 📂 Cấu trúc Project

```
khoa-luan-su-pham/
├── 📄 index.js                          # Entry point
├── 📄 package.json                      # Dependencies
├── 📄 .env                              # Environment config
├── 📚 API_DOCUMENTATION.md              # API detailed documentation
├── 📚 MONGODB_SCHEMA.md                 # Database schema details
├── 📚 SETUP_GUIDE.md                    # Installation guide
│
├── src/
│   ├── 📁 config/
│   │   ├── database.js                  # MongoDB connection
│   │   └── swagger.js                   # Swagger configuration
│   │
│   ├── 📁 schemas/
│   │   ├── User.js                      # User model with bcrypt
│   │   ├── Course.js                    # Course model
│   │   ├── Material.js                  # Material/Learning resource model
│   │   └── Activity.js                  # Activity logging with TTL
│   │
│   ├── 📁 middleware/
│   │   ├── auth.js                      # JWT authentication & RBAC
│   │   ├── errorHandler.js              # Error handling
│   │   └── activityLogger.js            # Activity logging
│   │
│   └── 📁 routes/
│       ├── auth.js                      # Login, Register, Get Profile
│       ├── materials.js                 # CRUD + Search + Download logging
│       ├── courses.js                   # CRUD + Enroll
│       └── statistics.js                # Dashboard & Analytics
│
├── 📁 public/
│   └── dashboard.html                   # Interactive dashboard with Chart.js
│
├── 📁 scripts/
│   ├── seedData.js                      # Generate 1000+ sample records
│   └── test-api.sh                      # API testing script
│
└── 📄 postman-collection.json           # Postman collection for testing
```

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register          - Đăng ký tài khoản mới
POST   /api/auth/login             - Đăng nhập
GET    /api/auth/me                - Lấy thông tin người dùng (yêu cầu token)
```

### Materials (Tài liệu)
```
GET    /api/materials              - Danh sách tài liệu (lọc, tìm kiếm, phân trang)
GET    /api/materials/:id          - Chi tiết tài liệu (ghi log view)
POST   /api/materials              - Tạo tài liệu (Teacher/Admin)
PUT    /api/materials/:id          - Cập nhật tài liệu
DELETE /api/materials/:id          - Xóa tài liệu
POST   /api/materials/:id/download - Ghi nhận lượt tải
```

### Courses (Khóa học)
```
GET    /api/courses                - Danh sách khóa học
GET    /api/courses/:id            - Chi tiết khóa học
POST   /api/courses                - Tạo khóa học (Teacher/Admin)
PUT    /api/courses/:id            - Cập nhật khóa học
POST   /api/courses/:id/enroll     - Học viên đăng ký khóa học
```

### Statistics (Thống kê)
```
GET    /api/statistics/dashboard   - Tổng hợp thống kê
GET    /api/statistics/materials   - Thống kê tài liệu
GET    /api/statistics/activities  - Thống kê hoạt động (theo ngày/người dùng/hành động)
GET    /api/statistics/users       - Thống kê người dùng (Admin only)
```

---

## 👤 Tài khoản Mẫu

Sau khi chạy `npm run seed`, bạn có thể đăng nhập bằng:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Admin** | admin@hnue.edu.vn | Admin@123456 |
| **Teacher** | teacher1@hnue.edu.vn | Teacher@123456 |
| **Student** | student001@student.hnue.edu.vn | Student@123456 |

---

## 💾 Database Schema

### 📊 Collections (4)

1. **Users** (~266 bản ghi)
   - 1 Admin
   - 15 Teachers
   - 250 Students

2. **Courses** (~40 bản ghi)
   - Từ các giảng viên khác nhau
   - Trên các cơ sở khác nhau

3. **Materials** (~300 bản ghi)
   - PDF, PowerPoint, Video, Images
   - Được phân phối trên 3 cơ sở
   - Hỗ trợ full-text search

4. **Activities** (~400 bản ghi)
   - Ghi log view, download, upload, update, delete
   - Auto-delete sau 90 ngày (TTL index)
   - Phân tán theo campus

### 🔑 Sharding Strategy

**Shard Key:** `campus` field
- Phân tán dữ liệu giữa 3 cơ sở
- Hỗ trợ query locality
- Giảm cross-shard queries

### 📈 Indexes

Tất cả collections đều có:
- ✓ Primary key (`_id`)
- ✓ Unique indexes (email, username, courseCode)
- ✓ Composite indexes (user + createdAt)
- ✓ Text search index (title, description, tags)
- ✓ TTL index (Activities)

---

## 🔐 Bảo mật

### Authentication
- ✅ **JWT (JSON Web Token)** - Token-based authentication
- ✅ **Bcryptjs** - Password hashing (salt rounds: 10)
- ✅ **Token expiration** - 7 ngày

### Authorization
- ✅ **RBAC** (Role-Based Access Control)
- ✅ **Admin** - Toàn quyền
- ✅ **Teacher** - Quản lý khóa học & tài liệu của mình
- ✅ **Student** - Xem & tải tài liệu

### Input Validation
- ✅ **Mongoose schema validation**
- ✅ **Email validation**
- ✅ **Length constraints**

---

## 📊 Dashboard Features

Truy cập: **http://localhost:3000/dashboard.html**

### 📈 Thống kê
- 👥 Tổng số người dùng
- 📚 Tổng số khóa học
- 📄 Tổng số tài liệu
- 📊 Hoạt động trong 7 ngày

### 📉 Biểu đồ
- 🥧 **Doughnut chart** - Hoạt động theo loại (view, download, upload, ...)
- 📊 **Bar chart** - Người dùng theo vai trò (Admin, Teacher, Student)

### ⭐ Top Materials
- Top 5 tài liệu được xem nhiều nhất
- Hiển thị số lượt xem và tải

### 🔐 Quản lý Session
- Đăng nhập/Đăng xuất
- Hiển thị thông tin người dùng hiện tại
- Auto-refresh dữ liệu mỗi 30 giây

---

## 🧪 Testing API

### Swagger UI (Khuyến nghị)
```
Truy cập: http://localhost:3000/api/docs
- Xem toàn bộ API
- Test trực tiếp trong trình duyệt
- Tự động ghi nhớ token
```

### Postman Collection
```bash
1. Mở Postman
2. Import file: postman-collection.json
3. Thiết lập biến: base_url = http://localhost:3000
4. Chạy requests
```

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@hnue.edu.vn",
    "password": "Teacher@123456"
  }'
```

### Test Script
```bash
bash scripts/test-api.sh
```

---

## 📈 Performance Optimization

### Indexes
- ✓ Field được query thường xuyên có index
- ✓ Shard key có index
- ✓ Text search index trên title, description, tags
- ✓ TTL index trên Activities

### Aggregation Pipeline
- ✓ Sử dụng MongoDB's native aggregation
- ✓ Pipeline operators tối ưu hóa
- ✓ Projection để giảm dữ liệu truyền

### Pagination
- ✓ Tất cả list endpoints hỗ trợ phân trang
- ✓ Giới hạn max items/page = 100

### Database Connection
- ✓ Connection pooling
- ✓ Retry logic
- ✓ Graceful shutdown

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Giải pháp:
docker start mongodb
# hoặc
mongod
```

### Port 3000 đã sử dụng
```
Đổi PORT trong .env hoặc:
lsof -i :3000
kill -9 <PID>
```

### Module not found
```
npm cache clean --force
npm install
```

### Seed data thất bại
```
npm run seed
# Kiểm tra MongoDB connection
```

---

## 📚 Tài liệu bổ sung

- **API_DOCUMENTATION.md** - Chi tiết tất cả endpoints
- **MONGODB_SCHEMA.md** - Schema, indexes, queries, aggregations
- **SETUP_GUIDE.md** - Hướng dẫn cài đặt chi tiết

---

## 🚀 Deployment

### Heroku
```bash
heroku create your-smartlearn-app
git push heroku main
```

### VPS/Cloud
```bash
# Sử dụng PM2
npm install -g pm2
pm2 start index.js --name smartlearn
pm2 save
pm2 startup
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Node.js Version** | v14+ |
| **MongoDB Version** | v4.0+ |
| **Total API Endpoints** | 15+ |
| **Collections** | 4 |
| **Sample Records** | 1,000+ |
| **Indexes** | 20+ |
| **Text Search Fields** | 3 |
| **Routes** | 4 (auth, materials, courses, statistics) |
| **Middleware** | 3 (auth, error, activity logging) |

---

## ✨ Tính năng nâng cao (Có thể mở rộng)

- 📧 Email notifications
- 🔔 Push notifications
- 💾 File upload to cloud storage (AWS S3, Google Cloud)
- 📱 Mobile app (React Native)
- 🔄 WebSocket real-time updates
- 🧪 Unit tests (Jest)
- 🐳 Docker Compose for full stack

---

## 👨‍💻 Công nghệ sử dụng

### Backend
- **Node.js & Express.js** - Web framework
- **MongoDB & Mongoose** - Database & ODM
- **JWT & bcryptjs** - Authentication & Security
- **Swagger** - API documentation
- **CORS** - Cross-origin requests

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript ES6+** - Logic
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### DevTools
- **nodemon** - Auto-reload development
- **dotenv** - Environment variables
- **Postman** - API testing

---

## 📝 License

Dự án học tập - Trường Đại học Sư phạm Hà Nội

---

## 📞 Support

Email: support@hnue.edu.vn

---

## 🎓 Learning Outcomes

Sau hoàn thành dự án này, bạn sẽ hiểu:

✅ Thiết kế cơ sở dữ liệu NoSQL  
✅ Hệ thống phân tán (Replication & Sharding)  
✅ RESTful API design  
✅ JWT authentication & RBAC  
✅ MongoDB aggregation pipelines  
✅ Performance optimization  
✅ Error handling & validation  
✅ API documentation (Swagger)  
✅ Dashboard & data visualization  

---

## 📅 Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Database Design | 4-5 hours | Schema, Indexes, Sample data |
| API Development | 8-10 hours | 15+ endpoints, Full CRUD |
| Dashboard | 3-4 hours | Interactive UI, Charts |
| Testing & Documentation | 4-5 hours | Tests, Docs, Postman collection |
| **Total** | **30 hours** | Full working system |

---

**Made with ❤️ for Learning**

Last Updated: December 2024

