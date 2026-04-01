const router = require('express').Router()
const { body, param } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

// PUT /api/user/address
router.post('/address',
  protect,
  body('label').isString().isLength({ min: 2, max: 60 }),
  body('detail').isString().isLength({ min: 5, max: 200 }),
  body('lat').optional().isFloat({ min: -90, max: 90 }),
  body('lng').optional().isFloat({ min: -180, max: 180 }),
  body('isDefault').optional().isBoolean(),
  validate,
  async (req, res) => {
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

router.delete('/address/:id', protect, param('id').isMongoId(), validate, async (req, res) => {
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
router.post('/save-cook', protect, body('cookId').isMongoId(), validate, async (req, res) => {
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
router.put('/fcm-token', protect, body('token').isString().isLength({ min: 10, max: 500 }), validate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
