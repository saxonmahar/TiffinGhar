const router = require('express').Router()
const { body, param, query } = require('express-validator')
const Cook = require('../models/Cook')
const { protect, cookOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

// GET /api/cooks  — list with optional filters
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['rating', 'price', 'newest']),
  validate,
  async (req, res) => {
  try {
    const { search, specialty, city = 'Kathmandu', sort = 'rating', page = 1, limit = 20 } = req.query

    const query = { isVerified: true, isOpen: true }
    if (city) query['location.city'] = new RegExp(city, 'i')
    if (specialty) query.specialties = new RegExp(specialty, 'i')
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialties: new RegExp(search, 'i') },
        { 'menu.name': new RegExp(search, 'i') },
      ]
    }

    const sortMap = { rating: { rating: -1 }, price: { 'menu.0.price': 1 }, newest: { createdAt: -1 } }
    const cooks = await Cook.find(query)
      .sort(sortMap[sort] || { rating: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name phone')

    const total = await Cook.countDocuments(query)
    res.json({ success: true, cooks, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/cooks/:id
router.get('/:id', param('id').isMongoId(), validate, async (req, res) => {
  try {
    const cook = await Cook.findById(req.params.id).populate('user', 'name phone')
    if (!cook) return res.status(404).json({ success: false, message: 'Cook not found' })
    res.json({ success: true, cook })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/cooks/register — become a cook
router.post('/register',
  protect,
  body('name').optional().isString().isLength({ min: 2, max: 80 }),
  body('bio').optional().isString().isLength({ max: 300 }),
  body('location.area').optional().isString().isLength({ max: 120 }),
  validate,
  async (req, res) => {
  try {
    const existing = await Cook.findOne({ user: req.user._id })
    if (existing) return res.status(400).json({ success: false, message: 'Already registered as cook' })

    const cook = await Cook.create({ ...req.body, user: req.user._id })
    req.user.role = 'cook'
    await req.user.save()
    res.status(201).json({ success: true, cook })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/cooks/my — update my cook profile
router.put('/my', protect, cookOnly, body('bio').optional().isString().isLength({ max: 300 }), validate, async (req, res) => {
  try {
    const cook = await Cook.findOneAndUpdate({ user: req.user._id }, req.body, { new: true })
    res.json({ success: true, cook })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/cooks/my/profile
router.get('/my/profile', protect, cookOnly, async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    res.json({ success: true, cook })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/cooks/my/menu — add menu item
router.post('/my/menu',
  protect,
  cookOnly,
  body('name').isString().isLength({ min: 2, max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('category').optional().isIn(['veg', 'nonveg', 'vegan']),
  validate,
  async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    cook.menu.push(req.body)
    await cook.save()
    res.json({ success: true, menu: cook.menu })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/cooks/my/menu/:itemId
router.put('/my/menu/:itemId',
  protect,
  cookOnly,
  param('itemId').isMongoId(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['veg', 'nonveg', 'vegan']),
  validate,
  async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    const item = cook.menu.id(req.params.itemId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' })
    Object.assign(item, req.body)
    await cook.save()
    res.json({ success: true, menu: cook.menu })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/cooks/my/menu/:itemId
router.delete('/my/menu/:itemId', protect, cookOnly, param('itemId').isMongoId(), validate, async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    cook.menu.pull(req.params.itemId)
    await cook.save()
    res.json({ success: true, menu: cook.menu })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/cooks/my/toggle-open
router.put('/my/toggle-open', protect, cookOnly, async (req, res) => {
  try {
    const cook = await Cook.findOne({ user: req.user._id })
    cook.isOpen = !cook.isOpen
    await cook.save()
    res.json({ success: true, isOpen: cook.isOpen })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
