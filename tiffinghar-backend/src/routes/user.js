const router = require('express').Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// PUT /api/user/address
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false)
    user.addresses.push(req.body)
    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/address/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses.pull(req.params.id)
    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/user/save-cook
router.post('/save-cook', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const idx = user.savedCooks.indexOf(req.body.cookId)
    if (idx > -1) user.savedCooks.splice(idx, 1)
    else user.savedCooks.push(req.body.cookId)
    await user.save()
    res.json({ success: true, savedCooks: user.savedCooks })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/user/fcm-token
router.put('/fcm-token', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
