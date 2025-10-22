import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL); // use MONGO_URL, not MONGO_URI
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("Mongo connection failed:", err);
    throw err;
  }
};

export default connectDB;
