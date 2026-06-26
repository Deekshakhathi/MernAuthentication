import dns from "node:dns";
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set in .env");
        }

        dns.setServers(["1.1.1.1", "8.8.8.8"]);

        mongoose.connection.on("connected", () => console.log("MongoDB connected successfully"));
        mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
        mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

        await mongoose.connect(uri);
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message || error);
        process.exit(1);
    }
};

export default connectDB;