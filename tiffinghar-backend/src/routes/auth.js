require('dotenv').config()
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' })

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const sendSMS = async (phone, otp) => {
  // In production: use Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    await twilio.messages.create({
      body: `Your TiffinGhar OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    })
    return { sent: true, otp: null }
  }
  // Dev mode: return OTP in response
  console.log(`[DEV] OTP for ${phone}: ${otp}`)
  return { sent: false, otp }
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone || phone.length < 10)
      return res.status(400).json({ success: false, message: 'Valid phone number required' })

    const otp = process.env.NODE_ENV === 'production' ? generateOTP() : (process.env.DEV_OTP || '123456')
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone, name: '', otp, otpExpiry, isVerified: false })
    } else {
      user.otp = otp
      user.otpExpiry = otpExpiry
      await user.save()
    }

    const result = await sendSMS(phone, otp)
    res.json({
      success: true,
      message: result.sent ? 'OTP sent to your phone' : 'OTP sent (dev mode)',
      isNewUser: !user.name,
      ...(result.otp && { devOtp: result.otp }),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body
    const user = await User.findOne({ phone })

    if (!user) return res.status(400).json({ success: false, message: 'Phone not found. Please request OTP first.' })
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' })
    if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' })

    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    if (name && name.trim()) user.name = name.trim()
    await user.save()

    res.json({
      success: true,
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar },
      isNewUser: !user.name || user.name === '',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/login (direct — dev only)
router.post('/login', async (req, res) => {
  try {
    const { phone, name, role, extraData } = req.body
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone, name: name || '', isVerified: true, role: role || 'customer' })
    } else {
      if (name && !user.name) user.name = name
      if (role === 'cook' && user.role !== 'cook') user.role = 'cook'
      await user.save()
    }

    if (role === 'cook' && extraData?.area) {
      const Cook = require('../models/Cook')
      const existing = await Cook.findOne({ user: user._id })
      if (!existing) {
        await Cook.create({
          user: user._id, name: user.name, nameNe: user.name,
          bio: extraData.bio || '',
          location: { area: extraData.area, city: 'Kathmandu' },
          specialties: extraData.specialty ? [extraData.specialty] : [],
          isVerified: false, isOpen: false, menu: [],
        })
      }
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar },
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
