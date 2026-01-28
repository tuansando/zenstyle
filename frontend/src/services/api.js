import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Only set Content-Type if not already set (allows FormData to set its own)
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  console.log('🔵 API Request:', config.method.toUpperCase(), config.url, config.data)
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
