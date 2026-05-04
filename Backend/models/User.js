const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true },
  password: { 
    type: String, 
    required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 0
  },
  currentOTP: { 
    type: String, 
    default: null,
    select: true
  },
  otpExpires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);