import { api } from './client'

export const authAPI = {
  login:         (phone, name, role, extraData) => api.post('/auth/login', { phone, name, role, extraData }),
  me:            ()                 => api.get('/auth/me'),
  updateProfile: (data)             => api.put('/auth/update-profile', data),
}

export const cooksAPI = {
  list:         (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return api.get(`/cooks?${q}`)
  },
  get:          (id)          => api.get(`/cooks/${id}`),
  register:     (data)        => api.post('/cooks/register', data),
  myProfile:    ()            => api.get('/cooks/my/profile'),
  updateMy:     (data)        => api.put('/cooks/my', data),
  toggleOpen:   ()            => api.put('/cooks/my/toggle-open', {}),
  addMenuItem:  (data)        => api.post('/cooks/my/menu', data),
  updateMenuItem:(id, data)   => api.put(`/cooks/my/menu/${id}`, data),
  deleteMenuItem:(id)         => api.delete(`/cooks/my/menu/${id}`),
}

export const ordersAPI = {
  place:        (data)        => api.post('/orders', data),
  myOrders:     (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return api.get(`/orders/my?${q}`)
  },
  get:          (id)          => api.get(`/orders/${id}`),
  cancel:       (id)          => api.put(`/orders/${id}/cancel`, {}),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  incoming:     ()            => api.get('/orders/cook/incoming'),
}

export const reviewsAPI = {
  submit:       (data)        => api.post('/reviews', data),
  forCook:      (cookId)      => api.get(`/reviews/cook/${cookId}`),
}

export const userAPI = {
  addAddress:   (data)        => api.post('/user/address', data),
  deleteAddress:(id)          => api.delete(`/user/address/${id}`),
  toggleSave:   (cookId)      => api.post('/user/save-cook', { cookId }),
}
