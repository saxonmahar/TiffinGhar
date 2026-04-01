jest.mock('../utils/tokenStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(async () => 'test-token'),
  },
}))

describe('api client', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('attaches auth header and parses json', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    }))

    const { api } = require('./client')
    const data = await api.get('/health')
    expect(data.success).toBe(true)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('throws message for non-json error bodies', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      text: async () => 'Gateway failure',
    }))

    const { api } = require('./client')
    await expect(api.get('/x')).rejects.toThrow('Gateway failure')
  })
})
