require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

// Socket.IO for real-time order tracking
const io = new Server(server, { cors: { origin: '*' } })
app.set('io', io)

io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => socket.join(`order_${orderId}`))
  socket.on('join_cook',  (cookId)  => socket.join(`cook_${cookId}`))
})

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/cooks',   require('./routes/cooks'))
app.use('/api/orders',  require('./routes/orders'))
app.use('/api/cart',    require('./routes/cart'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/user',    require('./routes/user'))
app.use('/api/offers',  require('./routes/offers'))

app.get('/', (req, res) => res.json({ message: 'TiffinGhar API v2.0', status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000

const startServer = () => {
  server.listen(PORT, '0.0.0.0', () => console.log(`Server + WebSocket on port ${PORT}`))
}

// Start server immediately so healthcheck passes, then connect to DB
startServer()

mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('DB connection failed:', err.message)
    // Retry every 10 seconds
    setInterval(() => {
      mongoose.connect(process.env.MONGO_URI, { tls: true, serverSelectionTimeoutMS: 10000 })
        .then(() => console.log('MongoDB connected (retry)'))
        .catch(e => console.error('DB retry failed:', e.message))
    }, 10000)
  })
