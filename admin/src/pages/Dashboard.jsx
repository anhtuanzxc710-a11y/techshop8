import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useTranslation } from 'react-i18next'
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { DollarSign, ShoppingBag, Users, MessageSquare, TrendingUp, PackageSearch, CreditCard, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { t } = useTranslation();
  const { aToken, dashData, getDashData } = useContext(AdminContext)
  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  if (!dashData) return null;

  const stats = [
    { label: t('dashboard.total_revenue'), value: `${new Intl.NumberFormat('vi-VN').format(dashData.totalRevenue)}₫`, icon: DollarSign, color: 'bg-emerald-500', trend: '+12.5%', trendUp: true },
    { label: t('dashboard.total_orders'), value: dashData.totalOrders || 0, icon: ShoppingBag, color: 'bg-indigo-500', trend: '+5.2%', trendUp: true },
    { label: t('dashboard.processed'), value: dashData.processedOrders || 0, icon: CreditCard, color: 'bg-blue-500', trend: '+2.1%', trendUp: true },
    { label: t('dashboard.unprocessed'), value: dashData.unprocessedOrders || 0, icon: PackageSearch, color: 'bg-orange-500', trend: '-1.5%', trendUp: false },
    { label: t('dashboard.total_users'), value: dashData.users?.length || 0, icon: Users, color: 'bg-amber-500', trend: '+18.2%', trendUp: true },
    { label: t('dashboard.comments'), value: dashData.qcomments || 0, icon: MessageSquare, color: 'bg-rose-500', trend: '+4.3%', trendUp: true },
    { label: t('dashboard.low_stock'), value: dashData.lowStockCount || 0, icon: TrendingUp, color: 'bg-red-500', trend: '-2.0%', trendUp: false },
    { label: t('dashboard.active_vouchers'), value: `${dashData.voucherStats?.activeVouchers || 0} / ${dashData.voucherStats?.totalVouchers || 0}`, icon: DollarSign, color: 'bg-teal-500', trend: '0%', trendUp: true },
  ]

  // Monthly Revenue Chart Data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueChartData = dashData.monthlyRevenue.map(item => ({
    name: monthNames[item._id - 1],
    revenue: item.revenue
  }));

  // Order Status Pie Chart Data
  const cancelledOrders = Math.max(0, dashData.totalOrders - (dashData.processedOrders || 0) - (dashData.unprocessedOrders || 0));
  const orderPieData = [
    { name: t('dashboard.processed') || 'Processed', value: dashData.processedOrders || 0 },
    { name: t('dashboard.unprocessed') || 'Unprocessed', value: dashData.unprocessedOrders || 0 },
    { name: 'Cancelled/Other', value: cancelledOrders }
  ];
  const COLORS = ['#3b82f6', '#f97316', '#ef4444'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <button onClick={() => getDashData()} className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Làm mới dữ liệu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${item.color} p-3 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {item.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{item.value}</p>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> {t('dashboard.monthly_revenue')}
            </h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + '₫', 'Revenue']}
                  cursor={{stroke: '#e5e7eb', strokeWidth: 2}}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{t('dashboard.total_orders')} Overview</h2>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">{t('dashboard.top_selling')}</h2>
            <button onClick={() => navigate('/products')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {dashData.topSellingProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => navigate('/products')}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Best seller</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{product.totalSold}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{t('dashboard.units_sold')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">{t('dashboard.latest_users')}</h2>
            <button onClick={() => navigate('/users')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {dashData.users.slice(0, 5).map((user, index) => (
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" key={index} onClick={() => navigate('/users')}>
                <div className="flex items-center gap-4">
                  <img className="rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm" src={user.image} alt="" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


