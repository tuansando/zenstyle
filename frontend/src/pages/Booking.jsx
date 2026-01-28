import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, AlertCircle, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { appointmentService, serviceService, settingsService, orderService } from '../services/dataService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { formatCurrency } from '../utils/currency'

const Booking = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [capacityInfo, setCapacityInfo] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    staff_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }
    fetchServices()
    fetchStaff()
    // If admin or staff, fetch customers list
    if (user?.role === 'Admin' || user?.role === 'Stylist') {
      fetchCustomers()
    }
  }, [isAuthenticated, navigate, user])

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll()
      setServices(data.data || [])
    } catch (error) {
      toast.error('Unable to load service list')
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await api.get('/stylists')
      const data = response.data
      const stylists = data.data || []
      setStaff(stylists)
      if (stylists.length === 0) {
        console.warn('No active stylists found')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Unable to load stylist list')
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/users')
      const data = response.data
      // Filter only Client role
      const clients = (data.data || []).filter(u => u.role === 'Client' && u.is_active)
      setCustomers(clients)
    } catch (error) {
      console.log('Unable to load customer list')
    }
  }

  const fetchAvailableSlots = async (date) => {
    if (!date) return
    
    setLoadingSlots(true)
    try {
      const selectedService = services.find(s => s.id === parseInt(formData.service_id))
      const duration = selectedService?.duration_minutes || 60
      
      const response = await settingsService.getCapacityDashboard(date)
      setCapacityInfo(response)
      
      // Fetch available slots
      const slotsResponse = await api.get('/capacity/available-slots', {
        params: { date, duration }
      })
      
      setAvailableSlots(slotsResponse.data.available_slots || [])
    } catch (error) {
      console.error('Error fetching available slots:', error)
      toast.error('Unable to load available time slots')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // When date changes, fetch available slots
    if (name === 'appointment_date' && value) {
      fetchAvailableSlots(value)
    }
    
    // When service changes and date is selected, re-fetch slots with new duration
    if (name === 'service_id' && formData.appointment_date) {
      fetchAvailableSlots(formData.appointment_date)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter coupon code')
      return
    }

    if (!selectedService) {
      toast.error('Please select a service first')
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await orderService.validateCoupon({
        coupon_code: couponCode,
        total_amount: selectedService.price
      })
      
      setCouponDiscount(response.discount)
      setCouponApplied(true)
      toast.success(response.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
      setCouponDiscount(0)
      setCouponApplied(false)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentData = {
        service_ids: [parseInt(formData.service_id)],
        staff_id: formData.staff_id ? parseInt(formData.staff_id) : undefined,
        appointment_date: `${formData.appointment_date} ${formData.appointment_time}`,
        notes: formData.notes,
        coupon_code: couponApplied ? couponCode : null
      }

      // If Admin/Staff booking for a customer, add client_id
      if ((user?.role === 'Admin' || user?.role === 'Stylist') && formData.client_id) {
        appointmentData.client_id = parseInt(formData.client_id)
      }

      await appointmentService.book(appointmentData)
      toast.success('Booking successful!')
      
      // Reset form
      setFormData({
        client_id: '',
        service_id: '',
        staff_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      })

      // Redirect to dashboard
      setTimeout(() => {
        if (user?.role === 'Admin') {
          navigate('/dashboard/admin')
        } else if (user?.role === 'Stylist') {
          navigate('/dashboard/staff')
        } else {
          navigate('/dashboard/client')
        }
      }, 1500)

    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const selectedService = services.find(s => s.id === parseInt(formData.service_id))

  // Get min date (today)
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-20">
      <div className="container-zen max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-zen font-bold text-zen-800 mb-4">
            Book Appointment
          </h1>
          <div className="divider-zen"></div>
          <p className="text-xl text-zen-600">
            Choose your service and preferred time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-zen"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection (Admin/Staff only) */}
            {(user?.role === 'Admin' || user?.role === 'Stylist') && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <label className="block text-zen-800 font-semibold mb-2">
                  Select Customer *
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  className="input-zen"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email} - {customer.phone_number || 'N/A'}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-blue-700 mt-2">
                  You are booking on behalf of a customer
                </p>
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label className="block text-zen-800 font-semibold mb-2">
                Select Service *
              </label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                required
                className="input-zen"
              >
                <option value="">-- Select Service --</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.service_name} - {formatCurrency(service.price)} ({service.duration_minutes} mins)
                  </option>
                ))}
              </select>
            </div>

            {/* Staff/Stylist Selection */}
            <div>
              <label className="block text-zen-800 font-semibold mb-2">
                Select Stylist (Optional)
              </label>
              <select
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                className="input-zen"
              >
                <option value="">-- System will auto-assign --</option>
                {staff.length === 0 ? (
                  <option disabled>Loading stylist list...</option>
                ) : (
                  staff.map(stylist => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.name} ({stylist.role === 'Admin' ? 'Administrator' : 'Stylist'})
                    </option>
                  ))
                )}
              </select>
              <p className="text-sm text-zen-500 mt-1">
                {staff.length > 0 
                  ? `${staff.length} stylist(s) available. If not selected, the system will auto-assign.`
                  : 'Loading stylist list...'
                }
              </p>
            </div>

            {/* Selected Service Info */}
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-zen-50 rounded-lg"
              >
                <h3 className="font-semibold text-zen-800 mb-2">Service Information:</h3>
                <div className="space-y-1 text-zen-700">
                  <p><Clock className="inline w-4 h-4 mr-2" />Duration: {selectedService.duration_minutes} mins</p>
                  <p><User className="inline w-4 h-4 mr-2" />Price: {formatCurrency(selectedService.price)}</p>
                </div>
              </motion.div>
            )}

            {/* Date Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zen-800 font-semibold mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="input-zen"
                />
              </div>

              <div>
                <label className="block text-zen-800 font-semibold mb-2">
                  Appointment Time *
                </label>
                {loadingSlots ? (
                  <div className="input-zen flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-zen-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-zen-600">Loading available times...</span>
                  </div>
                ) : !formData.appointment_date ? (
                  <div className="input-zen flex items-center text-zen-500">
                    <AlertCircle size={18} className="mr-2" />
                    Please select a date first
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="input-zen flex items-center text-red-600">
                    <AlertCircle size={18} className="mr-2" />
                    No available time slots for this date
                  </div>
                ) : (
                  <select
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                    className="input-zen"
                  >
                    <option value="">-- Select Time --</option>
                    {availableSlots.map(slot => {
                      const capacityPercentage = ((slot.max_capacity - slot.available_stations) / slot.max_capacity) * 100
                      const status = capacityPercentage === 0 ? 'Available' :
                                    capacityPercentage < 50 ? 'Available' :
                                    capacityPercentage < 80 ? 'Limited' : 'Almost Full'
                      
                      return (
                        <option key={slot.time} value={slot.time}>
                          {slot.time} - {status} ({slot.available_stations} slots)
                        </option>
                      )
                    })}
                  </select>
                )}
                
                {/* Capacity Info */}
                {formData.appointment_date && capacityInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 text-sm"
                  >
                    <div className="flex items-center justify-between text-zen-600">
                      <span>Daily capacity:</span>
                      <span className={`font-semibold ${
                        capacityInfo.current_status.daily_capacity_percentage > 80 ? 'text-red-600' :
                        capacityInfo.current_status.daily_capacity_percentage > 50 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {capacityInfo.current_status.available_daily_slots} / {capacityInfo.capacity_settings.max_daily_appointments} available
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Coupon Code Section */}
            {selectedService && (
              <div className="p-4 bg-zen-50 rounded-xl border border-zen-200">
                <div className="space-y-3">
                  <label className="block text-zen-800 font-semibold">
                    <Tag size={18} className="inline mr-2" />
                    Coupon Code (Optional)
                  </label>
                  
                  {!couponApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 input-zen"
                      />
                      <button
                        type="button"
                        onClick={validateCoupon}
                        disabled={validatingCoupon}
                        className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-earth transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Tag size={18} className="text-green-600" />
                          <span className="font-semibold text-green-700">{couponCode}</span>
                        </div>
                        <span className="text-sm text-green-600">
                          Discount: {formatCurrency(couponDiscount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="pt-3 border-t border-zen-200 space-y-2">
                    <div className="flex items-center justify-between text-zen-700">
                      <span>Service Price:</span>
                      <span className="font-semibold">{formatCurrency(selectedService.price)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <>
                        <div className="flex items-center justify-between text-green-600">
                          <span>Discount:</span>
                          <span className="font-semibold">- {formatCurrency(couponDiscount)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zen-200">
                          <span className="font-semibold text-zen-800">Final Amount:</span>
                          <span className="text-xl font-bold text-sage">
                            {formatCurrency(selectedService.price - couponDiscount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-zen-800 font-semibold mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Enter notes or special requests..."
                className="input-zen resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-zen flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-white rounded-xl shadow-md border border-zen-200"
        >
          <h3 className="font-zen font-semibold text-zen-800 mb-3">Important Notes:</h3>
          <ul className="space-y-2 text-zen-600">
            <li>• Please arrive 10 minutes before your appointment</li>
            <li>• Cancellation available up to 24 hours in advance</li>
            <li>• Contact 0901 234 567 for assistance</li>
            <li>• Only available time slots are shown based on salon capacity</li>
          </ul>
        </motion.div>

        {/* Capacity Legend */}
        {formData.appointment_date && availableSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h4 className="font-semibold text-blue-900 mb-2">Time Slot Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-blue-800">Available - Plenty of slots</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-blue-800">Limited - Few slots left</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-blue-800">Almost Full - Book quickly!</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Booking
