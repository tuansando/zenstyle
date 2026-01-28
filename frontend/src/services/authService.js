import api from './api'

export const authService = {
  // Register
  register: async (data) => {
    const response = await api.post('/register', data)
    // Backend trả về 'access_token'
    const token = response.data.access_token || response.data.token
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/login', credentials)
    // Backend trả về 'access_token', không phải 'token'
    const token = response.data.access_token || response.data.token
    if (token) {
      localStorage.setItem('token', token)
      // Backend không trả về user object trong login, chỉ có role
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    }
    return response.data
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}
