import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";

import dns from "node:dns";
import userRouter from "./routes/userRoute.js";
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();
app.use(express.json());
// Error handling middleware for bad JSON requests
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: "Invalid JSON payload sent in request body. Please check your API client." });
    }
    next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://mern-authentication-eight-hazel.vercel.app'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

//api endpoint
app.get("/", (req, res) =>
    res.send("API working fine")
);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);

