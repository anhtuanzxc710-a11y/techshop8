import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { DollarSign, ShoppingBag, Users, MessageSquare, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const { aToken, dashData, getDashData } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  if (!dashData) return null;

  const stats = [
    { label: 'Total Revenue', value: `${new Intl.NumberFormat('vi-VN').format(dashData.totalRevenue)}₫`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: dashData.totalOrders || 0, icon: ShoppingBag, color: 'bg-indigo-500' },
    { label: 'Processed Orders', value: dashData.processedOrders || 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Unprocessed Orders', value: dashData.unprocessedOrders || 0, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Total Users', value: dashData.users?.length || 0, icon: Users, color: 'bg-amber-500' },
    { label: 'Comments', value: dashData.qcomments || 0, icon: MessageSquare, color: 'bg-rose-500' },
    { label: 'Low Stock Alerts', value: dashData.lowStockCount || 0, icon: TrendingUp, color: 'bg-red-500' },
    { label: 'Active Vouchers', value: `${dashData.voucherStats?.activeVouchers || 0} / ${dashData.voucherStats?.totalVouchers || 0}`, icon: DollarSign, color: 'bg-teal-500' },
  ]

  // Monthly Revenue Chart Data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueChartData = dashData.monthlyRevenue.map(item => ({
    name: monthNames[item._id - 1],
    revenue: item.revenue
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time statistics and revenue reports.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${item.color} p-3 rounded-xl text-white`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Monthly Revenue
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + '₫', 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {dashData.topSellingProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    #{index + 1}
                  </div>
                  <p className="text-sm font-medium text-gray-700 max-w-[200px] truncate">{product.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{product.totalSold}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest users */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">Latest Registered Users</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {dashData.users.slice(0, 5).map((user, index) => (
            <div className="flex items-center px-6 py-4 gap-4 hover:bg-gray-50 transition-colors" key={index}>
              <img className="rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm" src={user.image} alt="" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
