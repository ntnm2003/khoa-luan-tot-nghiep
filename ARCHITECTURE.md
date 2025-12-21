# 🔄 SmartLearn System Architecture & Flow

Tài liệu minh họa kiến trúc hệ thống phân tán

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Web Browser    │  │   Swagger UI     │  │   Postman API    │  │
│  │   Dashboard      │  │   /api/docs      │  │   Collection     │  │
│  │ dashboard.html   │  │                  │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │             │
└───────────┼─────────────────────┼─────────────────────┼─────────────┘
            │                     │                     │
        HTTP/HTTPS           HTTP/HTTPS           HTTP/HTTPS
            │                     │                     │
┌───────────▼─────────────────────▼─────────────────────▼─────────────┐
│                     EXPRESS.JS SERVER (PORT 3000)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               MIDDLEWARE LAYER                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  • CORS Handler              • Error Handler               │   │
│  │  • JSON Parser               • Activity Logger             │   │
│  │  • JWT Validator             • Request Logger              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐   │
│  │  /auth     │ │ /materials   │ │ /courses   │ │ /statistics  │   │
│  ├────────────┤ ├──────────────┤ ├────────────┤ ├──────────────┤   │
│  │• register  │ │• list        │ │• list      │ │• dashboard   │   │
│  │• login     │ │• detail      │ │• detail    │ │• materials   │   │
│  │• me        │ │• create      │ │• create    │ │• activities  │   │
│  │            │ │• update      │ │• update    │ │• users       │   │
│  │            │ │• delete      │ │• enroll    │ │              │   │
│  │            │ │• download    │ │            │ │              │   │
│  │            │ │• search      │ │            │ │              │   │
│  │            │ │• filter      │ │            │ │              │   │
│  └────────────┘ └──────────────┘ └────────────┘ └──────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                         │
                         │ (Mongoose ODM)
                         │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    MONGODB DATABASE LAYER                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌────────────┐ │
│  │  Users       │  │  Courses     │  │  Materials   │ │ Activities │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤ ├────────────┤ │
│  │ • _id        │  │ • _id        │  │ • _id        │ │ • _id      │ │
│  │ • username   │  │ • courseCode │  │ • title      │ │ • user     │ │
│  │ • email      │  │ • courseName │  │ • course     │ │ • material │ │
│  │ • password   │  │ • instructor │  │ • uploader   │ │ • course   │ │
│  │ • fullName   │  │ • students[] │  │ • fileType   │ │ • action   │ │
│  │ • role       │  │ • status     │  │ • viewCount  │ │ • timestamp│ │
│  │ • campus     │  │ • campus     │  │ • downloads  │ │ • campus   │ │
│  │ • lastLogin  │  │              │  │ • campus     │ │ • TTL (90d)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ └────────────┘ │
│       266              40                   300            400          │
│     records          records              records         records        │
│                                                                         │
│  Indexes: 20+                                                           │
│  Sharding Key: campus                                                   │
│  Replication: 3-node setup                                             │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────┐
│    User Browser     │
└──────────┬──────────┘
           │
           │ 1. POST /api/auth/login
           │ {email, password}
           │
     ┌─────▼──────────────────────┐
     │  Express Auth Route         │
     ├─────────────────────────────┤
     │ • Validate input            │
     │ • Find user in DB           │
     │ • Compare password (bcrypt) │
     │ • Generate JWT token        │
     └─────┬──────────────────────┘
           │
           │ 2. Return token & user info
           │ {token: "eyJ...", user: {...}}
           │
     ┌─────▼──────────────────────┐
     │   Browser Storage           │
     │   localStorage.token        │
     └─────┬──────────────────────┘
           │
           │ 3. All subsequent requests
           │ Header: "Authorization: Bearer eyJ..."
           │
     ┌─────▼──────────────────────────────┐
     │  JWT Verification Middleware        │
     ├─────────────────────────────────────┤
     │ • Extract token from header         │
     │ • Verify signature & expiration     │
     │ • Attach user to request object     │
     │ • Pass to next middleware/route     │
     └─────┬──────────────────────────────┘
           │
     ┌─────▼──────────────────────────────┐
     │  RBAC Authorization                 │
     ├─────────────────────────────────────┤
     │ • Check user.role                   │
     │ • Match against route requirements  │
     │ • Allow or deny access              │
     └─────┬──────────────────────────────┘
           │
     ┌─────▼──────────────────────────────┐
     │  Route Handler                      │
     │  (Process request & return response)│
     └─────────────────────────────────────┘
```

---

## 📊 Material Lifecycle & Activity Logging

```
┌──────────────────────────────────────────────────────────────────────┐
│                     MATERIAL LIFECYCLE                                │
└──────────────────────────────────────────────────────────────────────┘

1. CREATION
   ┌──────────────────────────┐
   │ Teacher/Admin uploads    │
   │ POST /api/materials      │
   └────────┬─────────────────┘
            │
    ┌───────▼────────────────────────────┐
    │ Validate input & course exists      │
    │ Save to Materials collection        │
    │ Increment Course.totalMaterials     │
    │ Log activity: "upload"              │
    └────────┬──────────────────────────┘
             │
             ├─ Materials Collection
             │  └─ New document created ✓
             │
             └─ Activities Collection
                └─ {action: "upload", ...}

2. DISTRIBUTION
   Student views material
   ┌──────────────────────────┐
   │ GET /api/materials/:id   │
   └────────┬─────────────────┘
            │
    ┌───────▼─────────────────────────┐
    │ Increment viewCount              │
    │ Log activity: "view"             │
    │ Return material with refs        │
    └────────┬──────────────────────┘
             │
             ├─ Materials Collection
             │  └─ viewCount: 125 (updated)
             │
             └─ Activities Collection
                └─ {action: "view", user_id, ...}

3. DOWNLOAD
   Student downloads material
   ┌──────────────────────────┐
   │ POST /api/materials/:id/ │
   │ download                 │
   └────────┬─────────────────┘
            │
    ┌───────▼──────────────────────┐
    │ Increment downloadCount       │
    │ Log activity: "download"      │
    └────────┬──────────────────────┘
             │
             ├─ Materials Collection
             │  └─ downloadCount: 68 (updated)
             │
             └─ Activities Collection
                └─ {action: "download", ...}

4. STATISTICS
   Dashboard aggregates data
   ┌──────────────────────────┐
   │ GET /api/statistics/     │
   │ dashboard                │
   └────────┬─────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │ Aggregate from Activities collection:     │
    │ • Count by action type                    │
    │ • Group by date                           │
    │ • Sum views/downloads per material        │
    └────────┬───────────────────────────────┘
             │
             └─ Return stats to dashboard

5. CLEANUP (TTL)
   After 90 days
   ┌──────────────────────────────────┐
   │ MongoDB TTL Index triggers        │
   │ createdAt + 90 days               │
   └────────┬──────────────────────────┘
            │
    ┌───────▼──────────────────────────┐
    │ Activities collection             │
    │ Old documents auto-deleted        │
    │ Statistics still available from   │
    │ Materials collection              │
    └─────────────────────────────────┘
```

---

## 🔄 API Request/Response Flow

```
REQUEST FLOW
════════════════════════════════════════════════════════════════════════

Client                Express.js            Mongoose              MongoDB
  │                      │                     │                    │
  │ GET /api/materials   │                     │                    │
  │ ?search=mongodb      │                     │                    │
  ├─ Headers            │                     │                    │
  ├─ Token              │                     │                    │
  └─────────────────────>│                     │                    │
                        │ 1. Route handler    │                    │
                        │ receives request    │                    │
                        │                     │                    │
                        │ 2. Validation      │                    │
                        │ (JWT, RBAC)        │                    │
                        │                     │                    │
                        │ 3. Parse query     │                    │
                        │ params & filters   │                    │
                        │                     │                    │
                        │ 4. Build query     │                    │
                        │────────────────────>│                    │
                        │                     │ 5. Text search     │
                        │                     │ $text index        │
                        │                     │────────────────────>│
                        │                     │                    │
                        │                     │ 6. Fetch docs      │
                        │                     │ from shard         │
                        │                     │<────────────────────│
                        │                     │                    │
                        │ 7. Populate refs   │                    │
                        │ (course, uploader) │                    │
                        │<────────────────────│                    │
                        │                     │                    │
                        │ 8. Format response │                    │
                        │ 9. Send status 200 │                    │
                        │                     │                    │
  200 OK                │                     │                    │
  {                     │                     │                    │
    success: true,      │                     │                    │
    data: [...],        │                     │                    │
    pagination: {}      │                     │                    │
  }                     │                     │                    │
  │<─────────────────────│                     │                    │
  │                     │                     │                    │
  │ JSON parsed in      │                     │                    │
  │ browser             │                    │                    │
  │ Display on dashboard│                     │                    │
  │                     │                     │                    │
  └─────────────────────────────────────────────────────────────────

ACTIVITY LOGGING ALONGSIDE REQUEST
════════════════════════════════════════════════════════════════════════

During GET /api/materials/:id:

GET Handler                    Activity Logger
     │                              │
     │ 1. Increment viewCount      │
     │ 2. Update Materials doc     │
     │                             │
     │                      3. Log activity (async)
     │                         action: "view"
     │                         user: req.user._id
     │                         material: req.params.id
     │                         campus: req.user.campus
     │                         timestamp: Date.now()
     │                             │
     │                      4. Insert to Activities
     │                         collection
     │                             │
     │ 5. Return material + 200 OK
     │ (Activity log happens
     │  independently)

The request completes immediately
while activity is logged asynchronously
```

---

## 📈 Sharding Strategy (Multi-Campus Distribution)

```
LOGICAL VIEW
═════════════════════════════════════════════════════════════════════

        ┌─────────────────────────────────┐
        │    SmartLearn Database          │
        │    (Distributed across 3        │
        │     geographic campuses)        │
        └──────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        │          │          │
   ┌────▼───┐ ┌────▼───┐ ┌───▼────┐
   │ Shard 1│ │ Shard 2│ │Shard 3 │
   │ Hà Nội │ │Đà Nẵng │ │TP. HCM │
   └────────┘ └────────┘ └────────┘

SHARD DISTRIBUTION BY CAMPUS
═════════════════════════════════════════════════════════════════════

Shard 1: campus = "Hà Nội"
  Documents:
  ├─ Users: ~90 (35% of students are HN-based)
  ├─ Courses: ~15
  ├─ Materials: ~100
  └─ Activities: ~140

Shard 2: campus = "Đà Nẵng"
  Documents:
  ├─ Users: ~88 (33% of students are DN-based)
  ├─ Courses: ~13
  ├─ Materials: ~100
  └─ Activities: ~130

Shard 3: campus = "TP. Hồ Chí Minh"
  Documents:
  ├─ Users: ~88 (32% of students are HCM-based)
  ├─ Courses: ~12
  ├─ Materials: ~100
  └─ Activities: ~130

QUERY LOCALITY EXAMPLE
═════════════════════════════════════════════════════════════════════

Query from Hà Nội campus:
  GET /api/materials?campus=Hà%20Nội

  ┌─ Route Handler
  │  Filter: { campus: "Hà Nội" }
  │
  └─ Shard Router (Mongos)
     │
     ├─ Check shard key: "Hà Nội"
     │
     └─ Route to Shard 1 ✓ (LOCAL)
        - Faster response
        - Reduced network latency
        - Lower bandwidth usage

If data needed from all campuses:
  GET /api/statistics/materials

  ┌─ Route Handler
  │  No campus filter
  │
  └─ Shard Router (Mongos)
     │
     ├─ Send to Shard 1
     ├─ Send to Shard 2
     ├─ Send to Shard 3
     │
     └─ Merge results
        (Slight latency increase for
         complete picture)
```

---

## 🔄 Replication Strategy

```
PRIMARY-SECONDARY REPLICATION SET
═════════════════════════════════════════════════════════════════════

        ┌─────────────────────────────┐
        │   MongoDB Replica Set       │
        │   (rs0)                     │
        └──────────┬──────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    │              │              │
┌───▼────┐    ┌────▼───┐    ┌───▼────┐
│ PRIMARY │    │SECONDARY│    │SECONDARY
│ (Hà Nội)│    │(Đà Nẵng)│    │(TP. HCM)
└─────────┘    └─────────┘    └────────┘

WRITE OPERATION
═════════════════════════════════════════════════════════════════════

Client writes new material:
  POST /api/materials

  ┌─ Express Route
  │  Validate & save to MongoDB
  │
  └─ Write to PRIMARY
     │
     ├─ Confirm write succeeds
     │ (write concern: majority)
     │
     └─ Replicate to SECONDARY nodes
        │
        ├─ Async replication
        │
        └─ Write complete when
           majority nodes have data

READ OPERATION
═════════════════════════════════════════════════════════════════════

Client reads materials:
  GET /api/materials

  Read from PRIMARY (default, most current)
  └─ Always consistent

  Can read from SECONDARY if needed
  └─ Eventual consistency (slightly stale)

HIGH AVAILABILITY
═════════════════════════════════════════════════════════════════════

If PRIMARY fails:

  Before:                  After (Automatic):
  ┌─────────┐              ┌──────────┐
  │ PRIMARY │              │ OLD      │
  │ DOWN ❌ │              │ SECONDARY│
  └─────────┘              │ → PRIMARY│
  ├ SECONDARY              │ ✓ NEW   │
  │ (replica 1)            └──────────┘
  ├ SECONDARY
  │ (replica 2)
  └ → Automatic failover
     New PRIMARY elected
     from secondaries
     Replication resumes
     when old primary online
```

---

## 📱 Dashboard Data Flow

```
DASHBOARD UPDATE CYCLE (30-second refresh)
═════════════════════════════════════════════════════════════════════

Dashboard.html
  │
  │ 1. User logs in
  │ Stores token in localStorage
  │
  ├─ Set Axios header
  │ Authorization: "Bearer token"
  │
  └─ Load Initial Data
     │
     ├─ GET /api/statistics/dashboard
     │  └─ Returns { summary, topMaterials, activitiesByAction }
     │
     ├─ Update stat cards (users, courses, etc.)
     │
     ├─ Initialize Chart.js
     │  ├─ Doughnut: activities by type
     │  └─ Bar: users by role
     │
     └─ Display top materials list

Wait 30 seconds...
     │
     └─ Refresh cycle
        ├─ GET /api/statistics/dashboard (again)
        ├─ Update charts with new data
        ├─ Update cards
        └─ Repeat...

ERROR HANDLING
═════════════════════════════════════════════════════════════════════

  Failed request?
        │
        └─ Display error message
           "❌ Lỗi tải dữ liệu: ..."

  Token expired?
        │
        └─ Auto show login form
           User re-authenticates
           
  Network error?
        │
        └─ Retry with exponential backoff
           (or skip this cycle)
```

---

## 🔐 Data Flow with Security

```
SECURED REQUEST WITH JWT
═════════════════════════════════════════════════════════════════════

1. CLIENT PREPARES REQUEST
   ─────────────────────────
   GET /api/materials/507f1f77...
   
   Headers:
   ├─ Content-Type: application/json
   └─ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. EXPRESS RECEIVES REQUEST
   ──────────────────────────
   ├─ Route handler intercepts
   │
   └─ JWT Middleware (protect)
      │
      ├─ Extract token from header
      │ "Authorization: Bearer ___"
      │
      ├─ Verify signature
      │ (uses JWT_SECRET from .env)
      │
      ├─ Check expiration
      │ (7 days from issue date)
      │
      └─ Decode payload
         ├─ Extract user ID
         │
         └─ Look up user in DB
            ├─ User found? ✓
            │  req.user = user object
            │
            └─ Attach to request
               Pass to route handler

3. ROUTE HANDLER PROCESSES
   ──────────────────────────
   ├─ Check RBAC (role)
   │ authorize('teacher', 'admin')
   │
   ├─ If student tries to create:
   │ └─ Return 403 Forbidden
   │    "người dùng không có quyền"
   │
   └─ If authorized:
      ├─ Process request
      ├─ Access DB
      └─ Return response

4. SECURITY VIOLATIONS
   ──────────────────────
   
   Expired Token?
   └─ Return 401 Unauthorized
      "Token không hợp lệ hoặc đã hết hạn"
   
   Invalid Signature?
   └─ Return 401 Unauthorized
      "Token không hợp lệ"
   
   No Token?
   └─ Return 401 Unauthorized
      "Không được phép truy cập"
   
   Wrong Role?
   └─ Return 403 Forbidden
      "Không có quyền thực hiện hành động này"
```

---

## 📊 Performance Optimization Flow

```
QUERY OPTIMIZATION
═════════════════════════════════════════════════════════════════════

User searches for materials:
GET /api/materials?search=mongodb&campus=Hà%20Nội&page=1&limit=10

  ┌─ MongoDB Text Search Index
  │  { title: "text", description: "text", tags: "text" }
  │
  └─ Fast full-text search
     (vs. slow regex scans)

  ┌─ Shard Key Filter
  │  campus = "Hà Nội"
  │
  └─ Query only Shard 1
     (vs. scatter-gather all shards)

  ┌─ Pagination
  │  limit: 10, skip: 0
  │
  └─ Reduce data transfer
     (vs. fetching all 300 materials)

  ┌─ Projection (optional)
  │  select only needed fields
  │
  └─ Smaller JSON payload
     (vs. transferring all fields)

  Result: Fast response ✓


INDEX USAGE
═════════════════════════════════════════════════════════════════════

Materials Collection Indexes:

1. Text Search Index
   db.materials.createIndex({
     title: "text",
     description: "text",
     tags: "text"
   })
   Used for: $text { $search: "..." }

2. Shard Key Index
   db.materials.createIndex({ campus: 1 })
   Used for: campus = "Hà Nội"

3. Category Index
   db.materials.createIndex({ category: 1 })
   Used for: category = "lecture"

4. Course Reference Index
   db.materials.createIndex({ course: 1 })
   Used for: course = ObjectId(...)

5. Creation Date Index
   db.materials.createIndex({ createdAt: -1 })
   Used for: sort { createdAt: -1 }

Every index optimizes queries,
reducing full collection scans.
```

---

This comprehensive architecture documentation covers:
- ✅ System architecture overview
- ✅ Authentication & security flow
- ✅ Material lifecycle & activity logging
- ✅ API request/response flow
- ✅ Sharding strategy for multi-campus
- ✅ Replication for high availability
- ✅ Dashboard data updates
- ✅ Performance optimization

---

**Reference:** For detailed API usage, see API_DOCUMENTATION.md  
**Reference:** For database details, see MONGODB_SCHEMA.md

