process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_123456789012345678901234'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/test'

const request = require('supertest')
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}))
const User = require('../models/User')
const { buildApp } = require('../app')

describe('auth and order validation', () => {
  const app = buildApp()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns health status', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('logs in and returns a token', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      phone: '9800000000',
      role: 'customer',
      avatar: '',
    })

    const res = await request(app).post('/api/auth/login').send({ phone: '9800000000', name: 'Test User' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeTruthy()
  })

  it('rejects invalid login payload', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone: '1' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})
