require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/cooks',   require('./routes/cooks'))
app.use('/api/orders',  require('./routes/orders'))
app.use('/api/cart',    require('./routes/cart'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/user',    require('./routes/user'))

app.get('/', (req, res) => res.json({ message: 'TiffinGhar API v1.0' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: err.message || 'Server error' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    )
  })
  .catch(err => { console.error('DB error:', err); process.exit(1) })
