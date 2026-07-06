const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String, unique: true, sparse: true },
  displayName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
