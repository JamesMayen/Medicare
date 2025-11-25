import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,                // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Try selecting server for 5 seconds
      socketTimeoutMS: 45000,         // Close idle sockets after 45 seconds
      useNewUrlParser: true,          // Recommended parser
      useUnifiedTopology: true,       // Use unified topology engine
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

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
