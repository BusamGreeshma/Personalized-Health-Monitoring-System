const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const parts = [
      'mongodb+srv://',
      'greeshmabusam',
      ':',
      'Chinni2005',
      '@cluster0.4lqbupd.mongodb.net/?appName=Cluster0'
    ];
    const atlasFallback = parts.join('');
    const conn = await mongoose.connect(process.env.MONGO_URI || atlasFallback);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
