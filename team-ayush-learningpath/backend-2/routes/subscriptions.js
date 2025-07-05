const express = require("express")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/subscriptions/plans
// @desc    Get all subscription plans
// @access  Public
router.get("/plans", async (req, res) => {
  try {
    const plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "USD",
        interval: "month",
        features: [
          "Access to 3 courses",
          "Basic progress tracking",
          "Community support",
          "Limited mock tests (2/month)",
        ],
        limitations: {
          maxCourses: 3,
          mockTestsPerMonth: 2,
          downloadContent: false,
          prioritySupport: false,
        },
      },
      {
        id: "premium",
        name: "Premium",
        price: 29.99,
        currency: "USD",
        interval: "month",
        yearlyPrice: 299.99,
        yearlyDiscount: 17,
        features: [
          "Unlimited access to all courses",
          "Advanced progress analytics",
          "Download content for offline viewing",
          "Priority support",
          "Unlimited mock tests",
          "AI-powered learning paths",
          "Certificates of completion",
        ],
        limitations: {
          maxCourses: -1, // unlimited
          mockTestsPerMonth: -1, // unlimited
          downloadContent: true,
          prioritySupport: true,
        },
        popular: true,
      },
    ]

    res.json({
      success: true,
      data: { plans },
    })
  } catch (error) {
    console.error("Get subscription plans error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
    })
  }
})

// @route   GET /api/subscriptions/current
// @desc    Get current user subscription
// @access  Private
router.get("/current", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const subscription = {
      plan: user.subscription.plan,
      status: user.subscription.status,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      autoRenew: user.subscription.autoRenew,
      billingCycle: user.subscription.billingCycle,
      hasPremiumAccess: user.hasPremiumAccess(),
    }

    res.json({
      success: true,
      data: { subscription },
    })
  } catch (error) {
    console.error("Get current subscription error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    })
  }
})

// @route   POST /api/subscriptions/upgrade
// @desc    Upgrade to premium subscription
// @access  Private
router.post("/upgrade", authenticateToken, async (req, res) => {
  try {
    const { plan, billingCycle = "monthly" } = req.body

    if (plan !== "premium") {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      })
    }

    const user = await User.findById(req.user._id)

    // In a real application, you would integrate with Stripe here
    // For now, we'll simulate the upgrade
    user.subscription.plan = "premium"
    user.subscription.status = "active"
    user.subscription.billingCycle = billingCycle
    user.subscription.startDate = new Date()

    // Set end date based on billing cycle
    const endDate = new Date()
    if (billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
    user.subscription.endDate = endDate
    user.subscription.autoRenew = true

    await user.save()

    res.json({
      success: true,
      message: "Successfully upgraded to premium",
      data: {
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          endDate: user.subscription.endDate,
          billingCycle: user.subscription.billingCycle,
        },
      },
    })
  } catch (error) {
    console.error("Upgrade subscription error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upgrade subscription",
    })
  }
})

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.subscription.plan === "free") {
      return res.status(400).json({
        success: false,
        message: "No active subscription to cancel",
      })
    }

    // In a real application, you would cancel the Stripe subscription here
    user.subscription.status = "cancelled"
    user.subscription.autoRenew = false
    // Keep access until end date

    await user.save()

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    })
  }
})

module.exports = router
