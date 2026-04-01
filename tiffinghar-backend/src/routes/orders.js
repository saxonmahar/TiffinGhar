const router = require('express').Router()
const { body, param, query } = require('express-validator')
const Order = require('../models/Order')
const Cook = require('../models/Cook')
const { protect, cookOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

// POST /api/orders — place order
router.post('/',
  protect,
  body('cookId').isMongoId(),
  body('items').isArray({ min: 1 }),
  body('items.*.menuItemId').isMongoId(),
  body('items.*.qty').isInt({ min: 1 }),
  body('paymentMethod').optional().isIn(['esewa', 'khalti', 'cash']),
  body('deliveryAddress.label').optional().isString().isLength({ max: 80 }),
  body('deliveryAddress.detail').optional().isString().isLength({ max: 200 }),
  validate,
  async (req, res) => {
  try {
    const { cookId, items, deliveryAddress, paymentMethod, notes, scheduledFor } = req.body

    const cook = await Cook.findById(cookId)
    if (!cook) return res.status(404).json({ success: false, message: 'Cook not found' })
    if (!cook.isOpen) return res.status(400).json({ success: false, message: 'Cook is currently closed' })

    // Build items with current prices
    const orderItems = items.map(item => {
      const menuItem = cook.menu.id(item.menuItemId)
      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`)
      return { menuItem: menuItem._id, name: menuItem.name, nameNe: menuItem.nameNe, price: menuItem.price, qty: item.qty }
    })

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
    const deliveryFee = cook.deliveryFee || 0
    const total = subtotal + deliveryFee

    const order = await Order.create({
      user: req.user._id, cook: cookId,
      items: orderItems, subtotal, deliveryFee, total,
      deliveryAddress, paymentMethod, notes, scheduledFor,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
      estimatedTime: 45,
      progress: 10,
    })

    // Update cook stats
    await Cook.findByIdAndUpdate(cookId, { $inc: { totalOrders: 1 } })

    res.status(201).json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/my — customer's orders
router.get('/my',
  protect,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'onway', 'delivered', 'cancelled']),
  validate,
  async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const query = { user: req.user._id }
    if (status) query.status = status

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('cook', 'name nameNe avatar location')

    const total = await Order.countDocuments(query)
    res.json({ success: true, orders, total })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/:id
router.get('/:id', protect, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cook', 'name nameNe avatar phone location')
      .populate('user', 'name phone')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    // Only owner or cook can view
    const cookDoc = await Cook.findOne({ user: req.user._id })
    if (order.user.toString() !== req.user._id.toString() && cookDoc?._id.toString() !== order.cook._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' })
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/orders/:id/status — cook updates status
router.put('/:id/status',
  protect,
  cookOnly,
  param('id').isMongoId(),
  body('status').isIn(['confirmed', 'preparing', 'onway', 'delivered', 'cancelled']),
  body('note').optional().isString().isLength({ max: 200 }),
  validate,
  async (req, res) => {
  try {
    const { status, note } = req.body
    const validStatuses = ['confirmed', 'preparing', 'onway', 'delivered', 'cancelled']
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' })

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const progressMap = { confirmed: 20, preparing: 45, onway: 75, delivered: 100, cancelled: 0 }
    order.status = status
    order.progress = progressMap[status] || order.progress
    order.statusHistory.push({ status, note })
    if (status === 'delivered') order.paymentStatus = order.paymentMethod === 'cash' ? 'paid' : order.paymentStatus
    await order.save()

    // Emit real-time update to customer
    const io = req.app.get('io')
    if (io) {
      io.to(`order_${order._id}`).emit('order_update', {
        orderId: order._id,
        status: order.status,
        progress: order.progress,
        statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
        note,
      })
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/orders/:id/cancel — customer cancels
router.put('/:id/cancel', protect, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel at this stage' })

    order.status = 'cancelled'
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' })
    await order.save()
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/cook/incoming — cook sees incoming orders
router.get('/cook/incoming', protect, cookOnly, async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    const orders = await Order.find({ cook: cook._id, status: { $in: ['pending', 'confirmed', 'preparing', 'onway'] } })
      .sort({ createdAt: -1 })
      .populate('user', 'name phone')
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
