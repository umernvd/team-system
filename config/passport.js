const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require('../config');

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ username: email });
          if (user) {
            user.googleId = profile.id;
            user.displayName = profile.displayName || user.displayName;
            await user.save();
            return done(null, user);
          }
        }
        const newUser = new User({
          username: email,
          googleId: profile.id,
          displayName: profile.displayName || 'Google User',
          role: 'user'
        });
        await newUser.save();
        user = newUser;
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
