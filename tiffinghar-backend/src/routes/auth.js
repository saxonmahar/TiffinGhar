const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const config = require('../config/env')
const { validate } = require('../middleware/validate')

const signToken = (id) => jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

// POST /api/auth/login
router.post('/login', body('phone').isString().isLength({ min: 7, max: 20 }), body('name').optional().isString().isLength({ min: 2, max: 80 }), validate, async (req, res) => {
  try {
    const { phone, name } = req.body
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone, name: name || 'User', isVerified: true, role: 'customer' })
    } else {
      if (name && user.name === 'User') user.name = name
      await user.save()
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar },
      isNew: !user.name || user.name === 'User',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user })
})

// PUT /api/auth/update-profile
router.put('/update-profile',
  protect,
  body('name').optional().isString().isLength({ min: 2, max: 80 }),
  body('email').optional().isEmail(),
  validate,
  async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true }).select('-otp -otpExpiry')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
