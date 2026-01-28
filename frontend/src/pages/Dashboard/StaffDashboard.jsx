import { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils/currency'
import { motion } from 'framer-motion'
import { Calendar, Package, LogOut, TrendingUp, Users, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { appointmentService, staffService, orderService } from '../../services/dataService'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const StaffDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchStatistics()
    if (activeTab === 'appointments') fetchAppointments()
    if (activeTab === 'orders') fetchOrders()
  }, [activeTab])

  useEffect(() => {
    setSearchTerm('')
    setStatusFilter('all')
  }, [activeTab])

  const fetchStatistics = async () => {
    try {
      const data = await staffService.getMyStatistics()
      setStats(data.data)
    } catch (error) {
      toast.error('Unable to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAll()
      setAppointments(data.data || data || [])
    } catch (error) {
      toast.error('Unable to load appointments')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : (data.data || []))
    } catch (error) {
      toast.error('Unable to load orders')
    }
  }

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status)
      toast.success('Status updated')
      fetchAppointments()
    } catch (error) {
      toast.error('Unable to update')
    }
  }

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status)
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Unable to update')
    }
  }

  const filterAppointments = (aptList) => {
    return aptList.filter(apt => {
      const matchSearch = searchTerm === '' ||
        apt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.details?.some(d => d.service?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchStatus = statusFilter === 'all' || apt.status === statusFilter
      return matchSearch && matchStatus
    })
  }

  const filterOrders = (orderList) => {
    return orderList.filter(order => {
      const matchSearch = searchTerm === '' ||
        order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toString().includes(searchTerm)
      const matchStatus = statusFilter === 'all' || order.status === statusFilter
      return matchSearch && matchStatus
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-zen"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-zen-700 to-zen-900 text-white py-8">
        <div className="container-zen">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="http://127.0.0.1:8000/images/zen-logo.png" 
                alt="ZenStyle Logo" 
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-zen font-bold mb-2">
                  Staff Dashboard
                </h1>
                <p className="text-zen-200">Welcome, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-zen py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'orders', label: 'Orders', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-zen-600 text-white shadow-lg'
                  : 'bg-white text-zen-600 hover:bg-zen-50'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">Overview Statistics</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card-zen">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zen-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-zen-800">{stats?.total_appointments || 0}</p>
                  </div>
                  <Calendar className="text-zen-400" size={40} />
                </div>
              </div>
              <div className="card-zen">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zen-600 mb-1">Today's Appointments</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.today_appointments || 0}</p>
                  </div>
                  <Calendar className="text-blue-400" size={40} />
                </div>
              </div>
              <div className="card-zen">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zen-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.completed || 0}</p>
                  </div>
                  <TrendingUp className="text-green-400" size={40} />
                </div>
              </div>
              <div className="card-zen">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zen-600 mb-1">This Week</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.this_week_appointments || 0}</p>
                  </div>
                  <Users className="text-purple-400" size={40} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-xl font-zen font-bold text-zen-800 mb-4">Quick Access</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('appointments')}
                  className="card-zen text-left hover:shadow-lg transition-shadow"
                >
                  <Calendar className="text-zen-600 mb-3" size={32} />
                  <h4 className="text-lg font-semibold text-zen-800 mb-2">Manage Appointments</h4>
                  <p className="text-zen-600">View and update appointment status</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('orders')}
                  className="card-zen text-left hover:shadow-lg transition-shadow"
                >
                  <Package className="text-zen-600 mb-3" size={32} />
                  <h4 className="text-lg font-semibold text-zen-800 mb-2">Manage Orders</h4>
                  <p className="text-zen-600">Track and process orders</p>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">Manage Appointments</h2>
            
            {/* Search and Filter */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by customer name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="card-zen overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zen-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-zen-800">Customer</th>
                      <th className="px-4 py-3 text-left text-zen-800">Staff</th>
                      <th className="px-4 py-3 text-left text-zen-800">Service</th>
                      <th className="px-4 py-3 text-left text-zen-800">Date & Time</th>
                      <th className="px-4 py-3 text-left text-zen-800">Total</th>
                      <th className="px-4 py-3 text-left text-zen-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterAppointments(appointments).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-zen-600">
                          {searchTerm || statusFilter !== 'all' ? 'No matching appointments found' : 'No appointments yet'}
                        </td>
                      </tr>
                    ) : (
                      filterAppointments(appointments).map((apt) => (
                        <tr key={apt.appointment_id} className="border-t border-zen-100 hover:bg-zen-50">
                          <td className="px-4 py-3 text-zen-800">{apt.user?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-zen-800">{apt.staff?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-zen-600">
                            {apt.details?.map(d => d.service?.service_name).join(', ') || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-zen-600">
                            {format(new Date(apt.appointment_date), 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-3 text-zen-800 font-semibold">
                            {formatCurrency(apt.total_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={apt.status}
                              onChange={(e) => handleUpdateAppointmentStatus(apt.appointment_id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${
                                apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">Manage Orders</h2>
            
            {/* Search and Filter */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="card-zen overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zen-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-zen-800">Order ID</th>
                      <th className="px-4 py-3 text-left text-zen-800">Customer</th>
                      <th className="px-4 py-3 text-left text-zen-800">Products</th>
                      <th className="px-4 py-3 text-left text-zen-800">Total</th>
                      <th className="px-4 py-3 text-left text-zen-800">Status</th>
                      <th className="px-4 py-3 text-left text-zen-800">Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterOrders(orders).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-zen-600">
                          {searchTerm || statusFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
                        </td>
                      </tr>
                    ) : (
                      filterOrders(orders).map((order) => (
                        <tr key={order.id} className="border-t border-zen-100 hover:bg-zen-50">
                          <td className="px-4 py-3 text-zen-800 font-medium">#{order.id}</td>
                          <td className="px-4 py-3 text-zen-800">
                            {order.client?.name || 'N/A'}
                            <br />
                            <span className="text-sm text-zen-600">{order.client?.email}</span>
                          </td>
                          <td className="px-4 py-3 text-zen-600">
                            {order.order_details?.map(d => d.product?.product_name).filter(Boolean).join(', ') || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-zen-800 font-semibold">
                            {formatCurrency(order.total_amount || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              disabled={['Completed', 'Cancelled'].includes(order.status)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                                ['Completed', 'Cancelled'].includes(order.status) ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                              } ${
                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-zen-600">
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard
