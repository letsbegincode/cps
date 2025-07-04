const jwt = require("jsonwebtoken")
const User = require("../models/User")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

const authenticateToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.cookies?.token

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    console.log("🔐 Token received:", token)
    console.log("✅ Token decoded:", decoded)

    let user
    try {
      user = await User.findById(decoded.userId).select("-password")
    } catch (err) {
      console.error("❌ Error finding user:", err.message)
      return res.status(401).json({
        success: false,
        message: "Invalid token - malformed user ID",
      })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    }

    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}


const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return next()

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    if (decoded?.userId) {
      const user = await User.findById(decoded.userId).select("-password")
      if (user && user.isActive) {
        req.user = user
      }
    }

    return next()
  } catch (err) {
    console.warn("optionalAuth token invalid:", err.message)
    return next() // Don't block if token fails
  }
}



const requirePremium = (req, res, next) => {
  if (!req.user.hasPremiumAccess()) {
    return res.status(403).json({
      success: false,
      message: "Premium subscription required",
      code: "PREMIUM_REQUIRED",
    })
  }
  next()
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      })
    }
    next()
  }
}

const requireAdmin = requireRole(["admin"])
const requireInstructor = requireRole(["instructor", "admin"])

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requirePremium,
  requireRole,
  requireAdmin,
  requireInstructor,
}
