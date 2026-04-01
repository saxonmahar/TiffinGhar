const router = require('express').Router()
const { body } = require('express-validator')
const Offer = require('../models/Offer')
const Order = require('../models/Order')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

// GET /api/offers — list active offers
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    const offers = await Offer.find({
      isActive: true,
      $or: [{ validUntil: { $gte: now } }, { validUntil: null }],
    })
    res.json({ success: true, offers })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/offers/validate — validate a coupon code
router.post('/validate',
  protect,
  body('code').isString().trim().isLength({ min: 3, max: 20 }),
  body('orderAmount').isFloat({ min: 0 }),
  validate,
  async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true })

    if (!offer) return res.status(404).json({ success: false, message: 'Invalid coupon code' })

    const now = new Date()
    if (offer.validFrom && offer.validFrom > now)
      return res.status(400).json({ success: false, message: 'Coupon is not active yet' })
    if (offer.validUntil && offer.validUntil < now)
      return res.status(400).json({ success: false, message: 'Coupon has expired' })
    if (offer.usedCount >= offer.usageLimit)
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    if (orderAmount < offer.minOrder)
      return res.status(400).json({ success: false, message: `Minimum order Rs. ${offer.minOrder} required` })

    // Check per-user usage
    const userUsage = await Order.countDocuments({ user: req.user._id, couponCode: code.toUpperCase() })
    if (userUsage >= offer.userLimit)
      return res.status(400).json({ success: false, message: 'You have already used this coupon' })

    // Calculate discount
    let discount = 0
    if (offer.type === 'percent') {
      discount = Math.round((orderAmount * offer.value) / 100)
      if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount)
    } else if (offer.type === 'flat') {
      discount = Math.min(offer.value, orderAmount)
    } else if (offer.type === 'free_delivery') {
      discount = 0  // handled at order level
    }

    res.json({ success: true, offer, discount, finalAmount: orderAmount - discount })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Seed default offers (dev only)
router.post('/seed', async (req, res) => {
  try {
    await Offer.deleteMany({})
    await Offer.insertMany([
      { code: 'TIFFIN20', title: '20% off first order', titleNe: 'पहिलो अर्डरमा २०% छुट', type: 'percent', value: 20, maxDiscount: 100, minOrder: 150, forNewUsers: true, description: 'Get 20% off on your first order' },
      { code: 'FLAT50', title: 'Rs. 50 off', titleNe: 'Rs. ५० छुट', type: 'flat', value: 50, minOrder: 200, description: 'Flat Rs. 50 off on orders above Rs. 200' },
      { code: 'FREEDEL', title: 'Free Delivery', titleNe: 'निःशुल्क डेलिभरी', type: 'free_delivery', value: 0, minOrder: 100, description: 'Free delivery on any order' },
      { code: 'NEWARI10', title: '10% off Newari food', titleNe: 'नेवारी खानामा १०% छुट', type: 'percent', value: 10, minOrder: 180, description: '10% off on Newari cuisine orders' },
    ])
    res.json({ success: true, message: 'Offers seeded' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
