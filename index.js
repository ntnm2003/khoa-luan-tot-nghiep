require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

// Import database connection
const connectDB = require('./src/config/database');

// Import swagger configuration
const swaggerSpec = require('./src/config/swagger');

// Import routes
const authRoutes = require('./src/routes/auth');
const materialsRoutes = require('./src/routes/materials');
const coursesRoutes = require('./src/routes/courses');
const statisticsRoutes = require('./src/routes/statistics');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static('public'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Root endpoint - serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tìm thấy'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

