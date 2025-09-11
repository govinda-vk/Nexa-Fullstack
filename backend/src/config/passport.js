const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-get-from-console' && 
    process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-get-from-console' &&
    process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')) {
  
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // User exists, return user
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists with same email, link Google account
        user.googleId = profile.id;
        user.provider = 'google';
        user.isEmailVerified = true; // Google emails are verified
        
        // Update avatar if not set
        if (!user.avatar && profile.photos && profile.photos.length > 0) {
          user.avatar = profile.photos[0].value;
        }
        
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        provider: 'google',
        isEmailVerified: true, // Google emails are verified
        isActive: true
      });

      await user.save();
      return done(null, user);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));

  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️ Google OAuth not configured - missing credentials');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
