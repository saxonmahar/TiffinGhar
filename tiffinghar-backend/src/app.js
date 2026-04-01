const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const pinoHttp = require('pino-http')
const mongoose = require('mongoose')
const { randomUUID } = require('crypto')
const config = require('./config/env')

const originAllowed = (origin, allowlist) => {
  if (!origin) return true
  if (!allowlist.length) return !config.isProd
  return allowlist.includes(origin)
}

function buildApp(io) {
  const app = express()

  app.set('trust proxy', 1)
  app.set('io', io || null)

  app.use(pinoHttp({ genReqId: (req) => req.headers['x-request-id'] || randomUUID() }))
  app.use(helmet())
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }))
  app.use(cors({
    origin: (origin, cb) => {
      if (originAllowed(origin, config.apiOrigins)) return cb(null, true)
      cb(new Error('Origin not allowed'))
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use('/uploads', express.static('uploads'))

  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/cooks', require('./routes/cooks'))
  app.use('/api/orders', require('./routes/orders'))
  app.use('/api/cart', require('./routes/cart'))
  app.use('/api/reviews', require('./routes/reviews'))
  app.use('/api/user', require('./routes/user'))
  app.use('/api/offers', require('./routes/offers'))

  app.get('/', (req, res) => res.json({ message: 'TiffinGhar API v2.0', realtime: true }))
  app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }))
  app.get('/ready', (req, res) => {
    const ready = mongoose.connection.readyState === 1
    if (!ready) {
      return res.status(503).json({ success: false, status: 'degraded', db: 'disconnected' })
    }
    return res.json({ success: true, status: 'ready', db: 'connected' })
  })

  app.use((req, res) => {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Route not found' })
  })

  app.use((err, req, res, next) => {
    req.log?.error({ err }, 'Unhandled error')
    res.status(err.status || 500).json({
      success: false,
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Server error',
    })
  })

  return app
}

module.exports = { buildApp, originAllowed }
