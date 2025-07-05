const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/User")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          return done(null, user)
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value })

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id
          user.authProvider = "google"
          user.emailVerified = true

          // Update profile info if not already set
          if (!user.profile.avatar && profile.photos[0]) {
            user.profile.avatar = profile.photos[0].value
          }

          await user.save()
          return done(null, user)
        }

        // Create new user
        user = await User.createFromGoogleProfile(profile)
        return done(null, user)
      } catch (error) {
        console.error("Google OAuth error:", error)
        return done(error, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password")
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport
