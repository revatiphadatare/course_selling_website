// index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// Import routes
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js"; 

// --- Initialize App ---
dotenv.config();
const app = express();

// --- Verify essential environment variables ---
if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
} else {
  console.log("✅ Stripe Key Loaded");
}

// --- MongoDB Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};
await connectDB();

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
console.log("✅ Cloudinary Configured");

// --- CORS Setup ---
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://courseapp-xi.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// --- API Routes ---
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 CourseApp backend is running!",
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
