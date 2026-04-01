const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config/env')

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' })

    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = await User.findById(decoded.id).select('-otp -otpExpiry')
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' })
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

exports.cookOnly = (req, res, next) => {
  if (req.user.role !== 'cook' && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Cook access only' })
  next()
}

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access only' })
  next()
}
