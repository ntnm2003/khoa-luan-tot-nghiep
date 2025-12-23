const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartlearn';

    // Parse connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,  // Disable for compatibility
      w: 1,  // Change from 'majority' to 1
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      authSource: 'admin',  // Specify auth source
    };

    console.log(`Connecting to MongoDB: ${mongoUri.replace(/:[^:]*@/, ':****@')}`);

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    console.error('\nNếu gặp lỗi "authentication failed":');
    console.error('Sử dụng: MONGO_URI=mongodb://root:root@localhost:27017/smartlearn?authSource=admin');
    console.error('\nNếu gặp lỗi "connect ECONNREFUSED":');
    console.error('Khởi động MongoDB: docker run -d -p 27017:27017 --name mongodb mongo:5.0');
    console.error('Hoặc: mongod\n');
    process.exit(1);
  }
};

module.exports = connectDB;

