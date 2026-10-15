const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB Error:", err.message);
    });

    return conn;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw err;
  }
};

module.exports = connectDB;