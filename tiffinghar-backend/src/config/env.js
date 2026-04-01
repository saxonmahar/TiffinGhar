const parseOrigins = (value) => {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

const isProd = process.env.NODE_ENV === 'production'

const required = ['MONGO_URI', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

if (isProd && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production')
}

const apiOrigins = parseOrigins(process.env.CORS_ORIGINS)
const socketOrigins = parseOrigins(process.env.SOCKET_CORS_ORIGINS || process.env.CORS_ORIGINS)

if (isProd && apiOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be set in production')
}

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  apiOrigins,
  socketOrigins,
}
