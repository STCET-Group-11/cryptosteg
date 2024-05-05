const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  otpExpiry: Date
});

const AuthUser = mongoose.model('AuthUser', AuthUserSchema);

module.exports = AuthUser;