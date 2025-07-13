const express = require("express")
const crypto = require("crypto")
const passport = require("../config/passport")
const User = require("../models/User")
require("../models/Course") // <- only needed to support .populate("enrollments.courseId")

const { generateToken, authenticateToken } = require("../middleware/auth")
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../middleware/validation")

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      })
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      profile: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
      },
      authProvider: "local",
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      })
    }

    // For Google users, don't allow password login
    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Please sign in with Google",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Update last login
    await user.updateLastLogin()

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    })
  }
})

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
)

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
// @route   GET /api/auth/google/callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user, info) => {
    console.log("Google OAuth Callback:", { err, user, info })

    if (err || !user) {
      console.error("Google callback error:", err || "No user")
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000"
      return res.redirect(`${frontendURL}/login?error=auth_failed`)
    }

    try {
      // ✅ TOKEN GENERATED HERE
      const token = generateToken(user._id)

      // ✅ ✅ LOG IT!
      console.log("🔐 Google JWT token generated:", token)

      await user.updateLastLogin()

      // ✅ Redirect to frontend with token in query param
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000"
      return res.redirect(`${frontendURL}/auth/callback?token=${token}`)
    } catch (error) {
      console.error("Post-auth error:", error)
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000"
      return res.redirect(`${frontendURL}/login?error=auth_failed`)
    }
  })(req, res, next)
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotPasswordValidation, async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Don't allow password reset for Google users without password
    if (user.authProvider === "google" && !user.password) {
      return res.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save()

    // In a real application, you would send an email here
    // For development, log the token
    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset token for ${email}: ${resetToken}`)
    }

    res.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request. Please try again.",
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", resetPasswordValidation, async (req, res) => {
  try {
    const { token, password } = req.body

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      })
    }

    // Update password
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    res.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrollments.courseId", "title slug thumbnail")
    // .populate("learningPaths.pathId", "title description")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("Get current user error:", error.message, error.stack)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Private
router.post("/verify-email", authenticateToken, async (req, res) => {
  try {
    const { token } = req.body

    // In a real application, you would verify the token here
    // For now, we'll just mark the email as verified
    const user = await User.findById(req.user._id)
    user.emailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    res.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
    })
  }
})

module.exports = router
