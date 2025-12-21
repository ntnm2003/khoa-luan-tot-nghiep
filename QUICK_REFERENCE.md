#!/bin/bash

# SmartLearn API - Quick Reference Guide
# A cheat sheet for common commands and operations

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════╗
║                   SMARTLEARN API - QUICK REFERENCE               ║
╚═══════════════════════════════════════════════════════════════════╝

🚀 INSTALLATION & SETUP
═════════════════════════════════════════════════════════════════════

# 1. Install Node.js dependencies
npm install

# 2. Start MongoDB (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# 3. Generate sample data
npm run seed

# 4. Start server (Development)
npm run dev

# 5. Start server (Production)
npm start

# 6. Run API tests
bash scripts/test-api.sh


📚 ACCESSING THE SYSTEM
═════════════════════════════════════════════════════════════════════

API Documentation:    http://localhost:3000/api/docs
Dashboard UI:         http://localhost:3000/dashboard.html
Health Check:         http://localhost:3000/health
API Root:             http://localhost:3000/


🔐 AUTHENTICATION
═════════════════════════════════════════════════════════════════════

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@hnue.edu.vn",
    "password": "Teacher@123456"
  }'

# Response contains: token, user info

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"


📋 COMMON API OPERATIONS
═════════════════════════════════════════════════════════════════════

# Get materials list (with pagination)
curl -X GET "http://localhost:3000/api/materials?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"

# Search materials
curl -X GET "http://localhost:3000/api/materials?search=mongodb" \
  -H "Authorization: Bearer TOKEN"

# Get material detail
curl -X GET "http://localhost:3000/api/materials/MATERIAL_ID" \
  -H "Authorization: Bearer TOKEN"

# Download material (logs activity)
curl -X POST "http://localhost:3000/api/materials/MATERIAL_ID/download" \
  -H "Authorization: Bearer TOKEN"

# Get courses
curl -X GET "http://localhost:3000/api/courses" \
  -H "Authorization: Bearer TOKEN"

# Get statistics
curl -X GET "http://localhost:3000/api/statistics/dashboard" \
  -H "Authorization: Bearer TOKEN"


👥 SAMPLE ACCOUNTS
═════════════════════════════════════════════════════════════════════

Admin Account:
  Email:    admin@hnue.edu.vn
  Password: Admin@123456
  Role:     Full access to all features

Teacher Account:
  Email:    teacher1@hnue.edu.vn (teacher1-15 available)
  Password: Teacher@123456
  Role:     Create/manage courses and materials

Student Account:
  Email:    student001@student.hnue.edu.vn (student001-250 available)
  Password: Student@123456
  Role:     View materials, enroll in courses


🐛 TROUBLESHOOTING
═════════════════════════════════════════════════════════════════════

MongoDB not running?
  $ docker start mongodb
  or
  $ mongod

Port 3000 already in use?
  $ lsof -i :3000
  $ kill -9 <PID>

Module not found error?
  $ npm cache clean --force
  $ npm install

Seed data failed?
  1. Check MongoDB is running
  2. Check .env has correct MONGO_URI
  3. Run: npm run seed

JWT token expired?
  1. Login again
  2. Get new token
  3. Use new token in requests


📊 TESTING METHODS
═════════════════════════════════════════════════════════════════════

1. SWAGGER UI (Recommended)
   - Visit: http://localhost:3000/api/docs
   - Click on endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"

2. POSTMAN
   - Import: postman-collection.json
   - Set base_url variable
   - Run requests

3. CURL (Command Line)
   - Use curl commands from documentation
   - Set Authorization header with token

4. Dashboard
   - Visit: http://localhost:3000/dashboard.html
   - Login with sample account
   - View real-time statistics


📁 IMPORTANT FILES
═════════════════════════════════════════════════════════════════════

Configuration:
  .env                        Environment variables
  package.json                Dependencies & npm scripts

Source Code:
  index.js                    Main server file
  src/config/*                Database & Swagger config
  src/schemas/*               Data models
  src/middleware/*            Authentication & logging
  src/routes/*                API endpoints

Frontend:
  public/dashboard.html       Interactive dashboard

Documentation:
  README.md                   Project overview
  SETUP_GUIDE.md              Installation guide
  API_DOCUMENTATION.md        API reference
  MONGODB_SCHEMA.md           Database schema
  ARCHITECTURE.md             System design

Scripts:
  scripts/seedData.js         Generate sample data
  scripts/test-api.sh         API test script


🔍 USEFUL MONGODB QUERIES
═════════════════════════════════════════════════════════════════════

# Connect to MongoDB
mongosh mongodb://localhost:27017

# Select database
use smartlearn

# Show collections
show collections

# Count documents
db.users.countDocuments()
db.courses.countDocuments()
db.materials.countDocuments()
db.activities.countDocuments()

# Find one document
db.users.findOne()

# Find by ID
db.materials.findOne({ _id: ObjectId("507f1f77bcf86cd799439020") })

# Search materials by text
db.materials.find({ $text: { $search: "mongodb" } })

# Find user's activities
db.activities.find({ user: ObjectId("...") }).sort({ createdAt: -1 })

# View indexes
db.materials.getIndexes()

# Check database size
db.stats()


⚙️ ENVIRONMENT VARIABLES
═════════════════════════════════════════════════════════════════════

MONGO_URI=mongodb://localhost:27017/smartlearn
  → MongoDB connection string

JWT_SECRET=your_secret_key_here
  → Secret key for JWT signing
  → Change in production!

JWT_EXPIRE=7d
  → Token expiration time

PORT=3000
  → Server port

NODE_ENV=development
  → Environment (development/production)


📈 MONITORING
═════════════════════════════════════════════════════════════════════

Server is running?
  $ curl http://localhost:3000/health

Check logs:
  Watch terminal where npm run dev is running

Monitor MongoDB:
  mongosh
  use smartlearn
  db.stats()

Check API response:
  Use Swagger UI and check Network tab in DevTools


📚 DOCUMENTATION REFERENCE
═════════════════════════════════════════════════════════════════════

For Setup Issues:        → See SETUP_GUIDE.md
For API Usage:           → See API_DOCUMENTATION.md
For Database Details:    → See MONGODB_SCHEMA.md
For System Design:       → See ARCHITECTURE.md
For Implementation Info: → See PROJECT_COMPLETION.md
For Verification:        → See CHECKLIST.md


💾 BACKUP & RESTORE
═════════════════════════════════════════════════════════════════════

# Backup MongoDB
mongodump --db smartlearn --out /backup/smartlearn

# Restore MongoDB
mongorestore --db smartlearn /backup/smartlearn


🔄 COMMON WORKFLOWS
═════════════════════════════════════════════════════════════════════

WORKFLOW 1: Create Course & Add Materials
  1. Login as teacher
  2. POST /api/courses (create course)
  3. POST /api/materials (add materials to course)
  4. GET /api/courses/:id (view course & materials)

WORKFLOW 2: Student Learning Path
  1. Login as student
  2. GET /api/courses (browse courses)
  3. POST /api/courses/:id/enroll (enroll in course)
  4. GET /api/materials (view course materials)
  5. POST /api/materials/:id/download (access content)

WORKFLOW 3: View Statistics
  1. Login as teacher/admin
  2. GET /api/statistics/dashboard
  3. View charts & analytics
  4. Check top materials & user activity

WORKFLOW 4: Search & Filter
  1. GET /api/materials?search=DATABASE
  2. Filter: ?category=lecture&fileType=pdf
  3. Sort: ?sort=mostViewed
  4. Paginate: ?page=2&limit=20


🎯 QUICK COMMANDS SUMMARY
═════════════════════════════════════════════════════════════════════

npm install              Install dependencies
npm run dev              Start development server
npm run seed             Generate sample data
npm start                Start production server
npm run test             Run tests (if configured)

docker run ...           Start MongoDB
docker ps                List running containers
docker stop mongodb      Stop MongoDB
docker rm mongodb        Remove MongoDB container


🆘 GETTING HELP
═════════════════════════════════════════════════════════════════════

Check Documentation:
  1. README.md           - Start here
  2. SETUP_GUIDE.md      - For installation
  3. API_DOCUMENTATION.md - For API usage
  4. ARCHITECTURE.md     - For system design

Common Issues:
  1. MongoDB not running → Start docker/mongod
  2. Port in use         → Kill process on port 3000
  3. Dependencies fail   → npm cache clean && npm install
  4. Token expired       → Login again for new token
  5. Permission denied   → Check user role

Contact Support:
  Email: support@hnue.edu.vn
  Course: Hệ thống cơ sở dữ liệu phân tán
  University: Trường Đại học Sư phạm Hà Nội


═════════════════════════════════════════════════════════════════════

                    Happy coding! 🚀

        Made with ❤️ for the SmartLearn project
           Trường Đại học Sư phạm Hà Nội

═════════════════════════════════════════════════════════════════════

EOF

