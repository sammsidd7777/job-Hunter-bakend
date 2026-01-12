const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("../../config/db"); // adjust path if needed
const errorHandler = require("../../middleware/errorHandler");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

const app = express();

// Middlewares
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // set your frontend URL in Vercel env
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(express.json());

// ❌ Local upload paths won't work in Vercel
// You need cloud storage (S3 / Cloudinary). Keep these commented for now.
// const resumePath = process.env.RESUME_UPLOAD_DIR || 'uploads/resumes';
// const imagePath = process.env.IMAGE_UPLOAD_DIR || 'uploads/images';
// app.use('/uploads/resumes', express.static(path.join(__dirname, resumePath)));
// app.use('/uploads/images', express.static(path.join(__dirname, imagePath)));

// Routes
app.use("/auth", require("../../routes/auth"));
app.use("/users", require("../../routes/users"));
app.use("/jobs", require("../../routes/jobs"));
app.use("/applications", require("../../routes/applications"));
app.use("/img", require("../../routes/Img"));
app.use("/company", require("../../routes/company"));

// Error handling middleware
app.use(errorHandler);

// Export serverless function for Vercel
module.exports = serverless(app);
