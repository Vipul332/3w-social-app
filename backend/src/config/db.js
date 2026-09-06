const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * The app is intentionally designed to use exactly two collections
 * (users, posts) — likes and comments are embedded documents inside
 * posts, not separate collections.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
