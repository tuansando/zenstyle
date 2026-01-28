import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await login(credentials)
      
      // Get user info - có thể từ data.user hoặc từ localStorage
      const userInfo = data.user || JSON.parse(localStorage.getItem('user'))
      
      toast.success(`Welcome, ${userInfo?.name || userInfo?.username || 'user'}!`)
      
      // Redirect based on role
      const role = userInfo?.role || data.role
      if (role === 'Admin') {
        navigate('/dashboard/admin')
      } else if (role === 'Stylist') {
        navigate('/dashboard/staff')
      } else {
        navigate('/dashboard/client')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-700 via-zen-800 to-zen-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="http://127.0.0.1:8000/images/zen-logo.png" 
              alt="ZenStyle Salon Logo" 
              className="h-32 w-auto mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl font-zen font-bold text-zen-800 mb-2">Login</h1>
            <p className="text-zen-600">Welcome back to ZenStyle Salon</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-zen-800 font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zen-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="input-zen pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-zen-800 font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-zen-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-zen pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zen-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-zen flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-6 p-4 bg-zen-50 rounded-lg">
            <p className="text-sm text-zen-700 mb-2 font-semibold">Demo accounts:</p>
            <div className="space-y-1 text-xs text-zen-600">
              <p><strong>Admin:</strong> admin@zenstyle.com / admin123</p>
              <p><strong>Staff:</strong> minh@zenstyle.com / 123456</p>
              <p><strong>Client:</strong> client@example.com / 123456</p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-zen-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-zen-700 hover:text-zen-900 font-semibold">
              Register now
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-zen-600 hover:text-zen-800">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
