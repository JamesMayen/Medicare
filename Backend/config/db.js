import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔍 Attempting to connect to MongoDB...");
    console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1****@') : 'NOT SET');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,                // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Try selecting server for 5 seconds
      socketTimeoutMS: 45000,         // Close idle sockets after 45 seconds
      bufferCommands: false,          // Disable mongoose buffering
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected");
    });

    // Graceful shutdown - DB close handled in server.js

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`❌ Error Code: ${error.code}`);
    console.error(`❌ Error Name: ${error.name}`);
    if (error.code === 'ENOTFOUND') {
      console.error('❌ DNS resolution failed - check network or URI hostname');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - check if MongoDB server is running or accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timed out - check network connectivity');
    } else if (error.code === 8000) {
      console.error('❌ Authentication failed - check username/password in URI');
    }
    process.exit(1);
  }
};

export default connectDB;
