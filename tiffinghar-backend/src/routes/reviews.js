const router = require('express').Router()
const Review = require('../models/Review')
const Order = require('../models/Order')
const { protect } = require('../middleware/auth')

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' })
    if (!order) return res.status(400).json({ success: false, message: 'Order not found or not delivered' })
    if (order.rated) return res.status(400).json({ success: false, message: 'Already reviewed' })

    const review = await Review.create({ user: req.user._id, cook: order.cook, order: orderId, rating, comment })
    order.rated = true
    await order.save()
    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/reviews/cook/:cookId
router.get('/cook/:cookId', async (req, res) => {
  try {
    const reviews = await Review.find({ cook: req.params.cookId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name avatar')
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
