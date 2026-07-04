const path = require("path");
const fs = require("fs");
const rootEnv = path.join(__dirname, "..", ".env");
const localEnv = path.join(__dirname, ".env");
if (fs.existsSync(rootEnv)) {
  const parsed = require("dotenv").parse(fs.readFileSync(rootEnv));
  for (let k in parsed) process.env[k] = parsed[k];
}
if (fs.existsSync(localEnv)) {
  const parsed = require("dotenv").parse(fs.readFileSync(localEnv));
  for (let k in parsed) process.env[k] = parsed[k];
}
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const logger = require("./src/utils/logger");
const { connectDB } = require("./src/config/mongo");


// Database connection is now handled at the bottom of the file


const user_routes = require("./src/routes/user/index");
const car_register = require("./src/routes/car-register/index");
const vendorRoutes = require("./src/routes/vendorRoutes");

const app = express();

// --- SECURITY: BASE PROTECTION ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images
}));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount vendorRoutes BEFORE fileUpload middleware to allow Multer handling
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor", vendorRoutes);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
  })
);


app.use("/api/public", express.static("public"));
app.use("/api/uploads", express.static(path.join(__dirname, "public", "uploads")));

// --- SECURITY: RATE LIMITING (disabled in development) ---
const isDev = process.env.NODE_ENV !== "production";

// 1. General limiter for all API routes (100 per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 100,
  skip: () => isDev,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// 2. Stricter limiter for Auth (10 per 15 mins to prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 10,
  skip: () => isDev,
  message: { message: "Too many attempts, please try again after 15 minutes" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// 3. Very strict limiter for Contact (3 per hour to stop spam bots)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 0 : 3,
  skip: () => isDev,
  message: { message: "Message limit reached. Please try again after an hour." },
});
app.use("/api/contact", contactLimiter);

// ROUTES
app.use("/api/", user_routes);
app.use("/api/car-register", car_register);

// Connect MongoDB if URI is provided
connectDB().then(() => {
  const PORT = process.env.MAIN_PORT || process.env.PORT || 1000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to database before starting server:", err);
});
