const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' })

// POST /api/auth/login — direct phone login (no OTP)
router.post('/login', async (req, res) => {
  try {
    const { phone, name, role, extraData } = req.body
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone, name: name || 'User', isVerified: true, role: role || 'customer' })
    } else {
      if (name && user.name === 'User') user.name = name
      if (role && role === 'cook' && user.role !== 'cook') user.role = 'cook'
      await user.save()
    }

    // If registering as cook, create cook profile
    if (role === 'cook' && extraData?.area) {
      const Cook = require('../models/Cook')
      const existing = await Cook.findOne({ user: user._id })
      if (!existing) {
        await Cook.create({
          user: user._id,
          name: user.name,
          nameNe: user.name,
          bio: extraData.bio || '',
          location: { area: extraData.area, city: 'Kathmandu' },
          specialties: extraData.specialty ? [extraData.specialty] : [],
          isVerified: false,
          isOpen: false,
          menu: [],
        })
      }
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
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true }).select('-otp -otpExpiry')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
