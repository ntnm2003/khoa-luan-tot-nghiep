# 🚀 SmartLearn - Hướng dẫn cài đặt và chạy

Hệ thống quản lý học liệu phân tán với MongoDB, Node.js, JWT Authentication, và Swagger Documentation.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 14.x
- **MongoDB**: >= 4.0
- **npm** hoặc **yarn**

---

## 🔧 Cài đặt chi tiết

### Bước 1: Cài đặt Node.js

#### Windows/macOS
- Tải từ: https://nodejs.org/
- Chọn bản LTS (Long Term Support)
- Cài đặt bình thường

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
node --version
npm --version
```

### Bước 2: Cài đặt MongoDB

#### Sử dụng Docker (Khuyến nghị - Dễ nhất)
```bash
# Cài đặt Docker nếu chưa có: https://www.docker.com/

# Chạy MongoDB container
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:5.0

# Kiểm tra MongoDB đang chạy
docker ps | grep mongodb
```

#### Cài đặt MongoDB local
- **Windows**: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- **macOS**: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
- **Linux**: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

### Bước 3: Clone hoặc setup project

```bash
# Vào thư mục project
cd /path/to/khoa-luan-tot-nghiep

# Kiểm tra file package.json
ls -la package.json
```

### Bước 4: Cài đặt dependencies

```bash
npm install
```

Nếu gặp lỗi, thử:
```bash
npm cache clean --force
npm install
```

### Bước 5: Cấu hình môi trường

File `.env` đã được tạo sẵn. Nếu cần sửa:

```bash
# Xem file .env
cat .env

# Sửa file .env nếu cần (dùng editor yêu thích)
nano .env
```

**Nội dung `.env`:**
```
MONGO_URI=mongodb://localhost:27017/smartlearn
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345!@#
JWT_EXPIRE=7d
PORT=3000
NODE_ENV=development
```

**Nếu dùng MongoDB với Docker (có auth):**
```
MONGO_URI=mongodb://admin:admin123@localhost:27017/smartlearn?authSource=admin
```

### Bước 6: Tạo dữ liệu mẫu

```bash
# Tạo ~500 bản ghi mẫu
npm run seed
```

Kết quả:
```
🌱 Bắt đầu tạo dữ liệu mẫu...

🧹 Xóa dữ liệu cũ...
👥 Tạo dữ liệu người dùng...
   ✓ Tạo 266 người dùng
📚 Tạo dữ liệu khóa học...
   ✓ Tạo 40 khóa học
📄 Tạo dữ liệu tài liệu...
   ✓ Tạo 300 tài liệu
📊 Tạo dữ liệu hoạt động...
   ✓ Tạo 400 hoạt động
🔍 Tạo chỉ mục...
   ✓ Chỉ mục đã được tạo

✅ Dữ liệu mẫu đã được tạo thành công!

📋 Thông tin tài khoản mẫu:
   Admin:
     - Email: admin@hnue.edu.vn
     - Password: Admin@123456
   ...
```

### Bước 7: Khởi chạy server

#### Development Mode (với auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

**Kết quả:**
```
✅ Server is running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🏥 Health Check: http://localhost:3000/health
```

---

## 🌐 Truy cập ứng dụng

### 1. **Swagger API Documentation**
```
http://localhost:3000/api/docs
```

### 2. **Dashboard**
```
http://localhost:3000/dashboard.html
```
Hoặc:
```
http://localhost:3000/dashboard
```

### 3. **Health Check**
```
http://localhost:3000/health
```

### 4. **Home Page**
```
http://localhost:3000/
```

---

## 🧪 Thử nghiệm API

### Sử dụng Swagger UI (Khuyến nghị)
1. Truy cập: http://localhost:3000/api/docs
2. Click vào endpoint muốn test
3. Click "Try it out"
4. Nhập dữ liệu và click "Execute"

### Sử dụng Postman
1. Mở Postman
2. Click "Import"
3. Tải file `postman-collection.json`
4. Đặt `base_url` = `http://localhost:3000`
5. Chạy các request

### Sử dụng cURL
```bash
# Đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student001@student.hnue.edu.vn",
    "password": "Student@123456"
  }'

# Lấy danh sách khóa học
curl -X GET "http://localhost:3000/api/courses?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Chạy script test
```bash
# Cần cài jq trước: sudo apt install jq
bash scripts/test-api.sh
```

---

## 👥 Tài khoản mẫu để đăng nhập

### Admin
- **Email**: `admin@hnue.edu.vn`
- **Password**: `Admin@123456`
- **Quyền**: Toàn quyền

### Giảng viên (Teachers)
- **Email**: `teacher1@hnue.edu.vn` đến `teacher15@hnue.edu.vn`
- **Password**: `Teacher@123456` (chung cho tất cả)
- **Quyền**: Tạo/chỉnh sửa khóa học và tài liệu

### Học viên (Students)
- **Email**: `student001@student.hnue.edu.vn` đến `student250@student.hnue.edu.vn`
- **Password**: `Student@123456` (chung cho tất cả)
- **Quyền**: Xem khóa học, tải tài liệu, đăng ký khóa học

---

## 🐛 Khắc phục sự cố

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Giải pháp:**
```bash
# Nếu dùng Docker
docker start mongodb

# Kiểm tra MongoDB đang chạy
docker ps | grep mongodb

# Nếu cài local
mongod

# Hoặc khởi động MongoDB service
sudo systemctl start mongod
```

### Port 3000 đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Giải pháp:**
```bash
# Đổi port trong .env
PORT=3001

# Hoặc kill process
lsof -i :3000
kill -9 <PID>

# Trên Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module không tìm thấy
```
Error: Cannot find module 'express'
```

**Giải pháp:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### JWT Token lỗi
```
Token không hợp lệ hoặc đã hết hạn
```

**Giải pháp:** Đăng nhập lại để lấy token mới

### Seed data thất bại
```bash
# Kiểm tra MongoDB kết nối
npm run seed

# Xem log chi tiết
NODE_ENV=development npm run seed
```

---

## 📊 Kiểm tra cơ sở dữ liệu

### Sử dụng MongoDB Compass (GUI)
1. Tải: https://www.mongodb.com/products/tools/compass
2. Kết nối: `mongodb://localhost:27017`
3. Xem các database và collection

### Sử dụng MongoDB Shell
```bash
# Kết nối
mongosh mongodb://localhost:27017

# Chọn database
use smartlearn

# Xem collections
show collections

# Đếm documents
db.users.countDocuments()
db.courses.countDocuments()
db.materials.countDocuments()
db.activities.countDocuments()

# Xem 1 document
db.users.findOne()

# Tìm kiếm
db.materials.find({ category: "lecture" }).limit(5)
```

---

## 🔄 Cơ trở lại và Reset

### Xóa hết dữ liệu (Reset)
```bash
# Xóa từng collection
npm run seed

# Hoặc xóa database trong MongoDB Shell
mongosh
use smartlearn
db.dropDatabase()
```

### Xem logs
```bash
# Server logs sẽ hiển thị trong terminal
# Kiểm tra errors:
# - Network errors
# - Database errors
# - Authentication errors
```

---

## 📈 Monitoring

### Kiểm tra hiệu năng
1. Mở Browser DevTools (F12)
2. Tab "Network" để xem request/response
3. Tab "Console" để xem logs

### MongoDB Performance
```bash
mongosh
db.stats()
db.materials.getIndexes()
db.materials.explain().find({ category: "lecture" })
```

---

## 🚀 Triển khai (Deploy)

### Triển khai lên Heroku
```bash
# Cài Heroku CLI
npm install -g heroku

# Login
heroku login

# Tạo app
heroku create your-smartlearn-app

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Triển khai lên VPS
```bash
# SSH vào VPS
ssh user@your-server

# Cài Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone project
git clone your-repo
cd khoa-luan-tot-nghiep

# Cài dependencies
npm install

# Sử dụng PM2 để chạy
npm install -g pm2
pm2 start index.js --name smartlearn
pm2 save
pm2 startup
```

---

## 📚 Tài liệu tham khảo

- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/
- **Swagger**: https://swagger.io/

---

## 💡 Tips

1. **Luôn dùng environment variables** cho secrets (API keys, DB passwords, etc.)
2. **Kiểm tra logs** khi có lỗi
3. **Sử dụng Postman** để test API trước khi dùng dashboard
4. **Backup dữ liệu** định kỳ: `mongodump`
5. **Monitor MongoDB** nếu dùng production

---

## ✅ Kiểm tra hoàn thành

- [ ] Node.js cài đặt xong
- [ ] MongoDB chạy bình thường
- [ ] Dependencies cài đặt xong (npm install)
- [ ] File .env cấu hình đúng
- [ ] Dữ liệu mẫu đã tạo (npm run seed)
- [ ] Server chạy thành công (npm run dev)
- [ ] Truy cập được http://localhost:3000/api/docs
- [ ] Đăng nhập thành công qua Swagger
- [ ] Dashboard load được
- [ ] Dữ liệu hiển thị đúng

---

**Nếu gặp vấn đề, vui lòng kiểm tra lại các bước trên hoặc liên hệ support@hnue.edu.vn**

---

Last Updated: December 2024

