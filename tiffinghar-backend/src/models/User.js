const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true, unique: true },
  email:       { type: String, trim: true, lowercase: true },
  avatar:      { type: String, default: '' },
  role:        { type: String, enum: ['customer', 'cook', 'admin'], default: 'customer' },
  addresses: [{
    label:     String,
    detail:    String,
    lat:       Number,
    lng:       Number,
    isDefault: { type: Boolean, default: false },
  }],
  savedCooks:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cook' }],
  otp:         String,
  otpExpiry:   Date,
  isVerified:  { type: Boolean, default: false },
  fcmToken:    String,   // for push notifications
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
