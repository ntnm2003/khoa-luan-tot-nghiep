#!/bin/bash

# SmartLearn API - Testing Scripts
# Sử dụng các lệnh curl này để kiểm tra API

BASE_URL="http://localhost:3000"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SmartLearn API Testing ===${NC}\n"

# 1. Register a new student
echo -e "${YELLOW}1. Registering a new student...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser001",
    "email": "testuser001@student.hnue.edu.vn",
    "password": "TestUser@123456",
    "fullName": "Nguyễn Thử Nghiệm",
    "role": "student",
    "department": "Công nghệ thông tin",
    "campus": "Hà Nội"
  }')

echo "$REGISTER_RESPONSE" | jq .

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo -e "${GREEN}✓ Token: $TOKEN\n${NC}"

# 2. Get current user
echo -e "${YELLOW}2. Getting current user info...${NC}"
curl -s -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 3. Get courses list
echo -e "${YELLOW}3. Getting courses list...${NC}"
curl -s -X GET "$BASE_URL/api/courses?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 4. Get materials with search
echo -e "${YELLOW}4. Searching materials...${NC}"
curl -s -X GET "$BASE_URL/api/materials?search=database&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 5. Get dashboard statistics
echo -e "${YELLOW}5. Getting dashboard statistics...${NC}"
curl -s -X GET $BASE_URL/api/statistics/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# Login as teacher
echo -e "${YELLOW}6. Logging in as teacher...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@hnue.edu.vn",
    "password": "Teacher@123456"
  }')

echo "$LOGIN_RESPONSE" | jq .

TEACHER_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo -e "${GREEN}✓ Teacher Token: $TEACHER_TOKEN\n${NC}"

# 7. Create a new course (as teacher)
echo -e "${YELLOW}7. Creating a new course...${NC}"
COURSE_RESPONSE=$(curl -s -X POST $BASE_URL/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "courseCode": "CS2024",
    "courseName": "Thiết kế hệ thống phân tán",
    "description": "Khóa học về MongoDB và hệ thống phân tán",
    "credits": 3,
    "department": "Công nghệ thông tin",
    "semester": "20241",
    "campusOfferingLocation": "Hà Nội"
  }')

echo "$COURSE_RESPONSE" | jq .

COURSE_ID=$(echo "$COURSE_RESPONSE" | jq -r '.data._id')
echo -e "${GREEN}✓ Course ID: $COURSE_ID\n${NC}"

# 8. Create a material (as teacher)
echo -e "${YELLOW}8. Creating a new material...${NC}"
MATERIAL_RESPONSE=$(curl -s -X POST $BASE_URL/api/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Slide bài giảng - Giới thiệu MongoDB",
    "description": "Các slide về MongoDB fundamentals",
    "course": "'$COURSE_ID'",
    "fileType": "pdf",
    "fileUrl": "https://example.com/mongodb-intro.pdf",
    "fileSize": 5000000,
    "category": "lecture",
    "tags": ["mongodb", "nosql", "database"]
  }')

echo "$MATERIAL_RESPONSE" | jq .

MATERIAL_ID=$(echo "$MATERIAL_RESPONSE" | jq -r '.data._id')
echo -e "${GREEN}✓ Material ID: $MATERIAL_ID\n${NC}"

# 9. Student enrolls in course
echo -e "${YELLOW}9. Student enrolling in course...${NC}"
curl -s -X POST "$BASE_URL/api/courses/$COURSE_ID/enroll" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 10. Student views material (logs activity)
echo -e "${YELLOW}10. Student viewing material...${NC}"
curl -s -X GET "$BASE_URL/api/materials/$MATERIAL_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 11. Student downloads material (logs activity)
echo -e "${YELLOW}11. Student downloading material...${NC}"
curl -s -X POST "$BASE_URL/api/materials/$MATERIAL_ID/download" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n"

# 12. Get activity statistics (as teacher)
echo -e "${YELLOW}12. Getting activity statistics...${NC}"
curl -s -X GET "$BASE_URL/api/statistics/activities?groupBy=action" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq .

echo -e "\n"

# 13. Get materials statistics (as teacher)
echo -e "${YELLOW}13. Getting materials statistics...${NC}"
curl -s -X GET "$BASE_URL/api/statistics/materials" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq .

echo -e "\n"

# 14. Health check
echo -e "${YELLOW}14. Health check...${NC}"
curl -s -X GET $BASE_URL/health | jq .

echo -e "\n${GREEN}=== All tests completed ===${NC}\n"

