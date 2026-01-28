import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    avatar: null,
    avatarPreview: null
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [user, navigate])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile')
      const data = response.data.data
      setProfile(data)
      setFormData({
        name: data.name || '',
        phone_number: data.phone_number || '',
        password: '',
        password_confirmation: '',
        avatar: null,
        avatarPreview: data.avatar_url || null
      })
    } catch (error) {
      toast.error('Unable to load profile information')
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error('Password confirmation does not match!')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      if (formData.phone_number) data.append('phone_number', formData.phone_number)
      if (formData.password) {
        data.append('password', formData.password)
        data.append('password_confirmation', formData.password_confirmation)
      }
      if (formData.avatar) data.append('avatar', formData.avatar)

      // Use POST with _method for FormData compatibility
      data.append('_method', 'PUT')
      const response = await api.post('/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update user in context and localStorage
      const updatedUser = response.data.data
      updateUser(updatedUser)
      
      toast.success('Profile updated successfully!', {
        duration: 3000
      })
      
      await fetchProfile()
      
      // Clear password fields and avatar
      setFormData({ 
        ...formData, 
        password: '', 
        password_confirmation: '', 
        avatar: null 
      })
      
      // Optional: Navigate back after a short delay
      setTimeout(() => {
        const from = location.state?.from || '/'
        navigate(from, { replace: true })
      }, 1500)
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors?.password?.[0] ||
                       'Update failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-zen"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12">
      <div className="container-zen max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-zen-600 hover:text-zen-800 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-zen font-bold text-zen-800">
              Personal Information
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-zen-100 border-4 border-zen-200">
                {formData.avatarPreview ? (
                  <img 
                    src={formData.avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-zen-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-zen-600 text-white p-2 rounded-full cursor-pointer hover:bg-zen-700 transition-colors">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-4 text-zen-600">{profile.email}</p>
            <span className="mt-2 px-3 py-1 bg-zen-100 text-zen-800 rounded-full text-sm font-medium">
              {profile.role}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-zen-800 font-medium mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-zen-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-zen pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zen-800 font-medium mb-2">
                Email (cannot be changed)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zen-400" size={20} />
                <input
                  type="email"
                  value={profile.email}
                  className="input-zen pl-11 bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-zen-800 font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-zen-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="input-zen pl-11"
                  placeholder="0909123456"
                />
              </div>
            </div>

            <div className="border-t border-zen-200 pt-6">
              <h3 className="text-lg font-semibold text-zen-800 mb-4">
                Change Password (optional)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zen-800 font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-zen-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-zen pl-11 pr-11"
                      placeholder="Leave blank if not changing"
                      minLength="8"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zen-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zen-800 font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-zen-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="input-zen pl-11 pr-11"
                      placeholder="Re-enter new password"
                      minLength="8"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zen-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-zen flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            
            <p className="text-center text-sm text-zen-500 mt-4">
              After saving successfully, you will be redirected to the previous page
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
