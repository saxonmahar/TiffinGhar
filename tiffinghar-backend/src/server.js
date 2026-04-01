require('dotenv').config()
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')
const config = require('./config/env')
const { buildApp, originAllowed } = require('./app')
const app = buildApp()
const server = http.createServer(app)

// Socket.IO for real-time order tracking
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (originAllowed(origin, config.socketOrigins)) return cb(null, true)
      cb(new Error('Socket origin not allowed'))
    },
    credentials: true,
  },
})
app.set('io', io)

io.on('connection', (socket) => {
  // Customer joins their order room
  socket.on('join_order', (orderId) => socket.join(`order_${orderId}`))
  // Cook joins their dashboard room
  socket.on('join_cook', (cookId) => socket.join(`cook_${cookId}`))
  socket.on('disconnect', () => {})
})

mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(config.port, () =>
      console.log(`Server + WebSocket on port ${config.port}`)
    )
  })
  .catch(err => { console.error('DB error:', err); process.exit(1) })
