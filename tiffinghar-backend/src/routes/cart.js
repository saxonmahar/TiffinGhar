const router = require('express').Router()
const { protect } = require('../middleware/auth')
const User = require('../models/User')

// Cart is stored client-side (in AsyncStorage) for speed.
// This route validates items against real DB prices before checkout.
const Cook = require('../models/Cook')

// POST /api/cart/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { cookId, items } = req.body
    const cook = await Cook.findById(cookId)
    if (!cook) return res.status(404).json({ success: false, message: 'Cook not found' })

    const validated = items.map(item => {
      const menuItem = cook.menu.id(item.menuItemId)
      if (!menuItem || !menuItem.available) throw new Error(`${item.name} is no longer available`)
      return { ...item, price: menuItem.price, name: menuItem.name }
    })

    const subtotal = validated.reduce((s, i) => s + i.price * i.qty, 0)
    res.json({ success: true, items: validated, subtotal, deliveryFee: cook.deliveryFee || 0 })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

module.exports = router
