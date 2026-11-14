// config/db.js
// This file contains one small function that connects Express to MongoDB.
// We call it once when the server starts (see server.js).

const mongoose = require('mongoose');

async function connectDB() {
  try {
    // MONGO_URI comes from the .env file, for example:
    // mongodb://127.0.0.1:27017/pawhaven
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
