const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
const session = require("express-session")
const MongoStore = require("connect-mongo")
require("dotenv").config()

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const passport = require("./config/passport")

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const app = express()

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1)

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3000",
        "https://localhost:3000",
      ]

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Allow preflight requests through
app.options("*", cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
})

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/educational-platform",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/educational-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected")
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API routes
app.use("/api/auth", authLimiter, authRoutes)
const { authenticateToken } = require("./middleware/auth")
app.use("/api/users", authenticateToken, userRoutes)

const courseRoutes = require("./routes/courses")
app.use("/api/courses", courseRoutes)


// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed")
    process.exit(0)
  })
})

module.exports = app
