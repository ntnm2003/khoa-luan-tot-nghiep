const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartLearn API - Learning Management System',
      version: '1.0.0',
      description: 'API để quản lý học liệu, khóa học và hoạt động học tập trên hệ thống phân tán MongoDB',
      contact: {
        name: 'Trường Đại học Sư phạm Hà Nội',
        email: 'support@hnue.edu.vn'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token từ endpoint login'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

