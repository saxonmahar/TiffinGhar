const parseOrigins = (value) => {
  if (!value) return ['*']
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

const isProd = process.env.NODE_ENV === 'production'

// Validate required vars — warn but don't crash in production
const required = ['MONGO_URI', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) {
    console.error(`WARNING: Missing environment variable: ${key}`)
    if (!isProd) throw new Error(`Missing required environment variable: ${key}`)
  }
}

const apiOrigins = parseOrigins(process.env.CORS_ORIGINS)
const socketOrigins = parseOrigins(process.env.SOCKET_CORS_ORIGINS || process.env.CORS_ORIGINS)

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'tiffinghar_fallback_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  apiOrigins,
  socketOrigins,
}
