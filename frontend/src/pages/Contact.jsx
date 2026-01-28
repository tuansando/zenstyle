import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { contactService } from '../services/dataService'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await contactService.submit(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <section className="section-zen bg-gradient-to-r from-zen-800 to-zen-900 text-white">
        <div className="container-zen text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-zen font-bold mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90"
          >
            We are always ready to support you
          </motion.p>
        </div>
      </section>

      <div className="container-zen py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-zen font-bold text-zen-800 mb-8">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-zen-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-zen-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-zen-800 mb-1">Address</h3>
                  <p className="text-zen-600">21Bis Hau Giang Str, W.Tan Son Nhat, D.Tan Binh, HCMC</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-zen-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-zen-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-zen-800 mb-1">Phone</h3>
                  <p className="text-zen-600">0901 234 567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-zen-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-zen-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-zen-800 mb-1">Email</h3>
                  <p className="text-zen-600">info@zenstyle.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-zen-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-zen-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-zen-800 mb-1">Opening Hours</h3>
                  <p className="text-zen-600">Monday - Sunday: 9:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-zen"
          >
            <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">Send Message</h2>
            
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Thank you for contacting us! We will respond as soon as possible.
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-zen"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-zen"
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-zen"
                />
              </div>
              <div>
                <textarea
                  rows="5"
                  name="message"
                  placeholder="Message content *"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="input-zen resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn-zen w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl overflow-hidden shadow-xl"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3919.0462507235657!2d106.6634433!3d10.8077697!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752932a43e5461%3A0xb1191ceca1117102!2sFPT%20Arena!5e0!3m2!1svi!2s!4v1769013508422!5m2!1svi!2s" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="ZenStyle Salon Location"
          ></iframe>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact
