import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, Layers, Users, ShoppingCart, 
  Package, MessageSquare, Bell, Ticket, X 
} from 'lucide-react'

const Sidebar = ({ isVisible, setSidebarVisible }) => {
  const { t } = useTranslation();
  
  const menuItems = [
    { path: '/', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { path: '/categories', label: t('sidebar.categories'), icon: Layers },
    { path: '/users', label: t('sidebar.users'), icon: Users },
    { path: '/all-carts', label: t('sidebar.orders'), icon: ShoppingCart },
    { path: '/products-list', label: t('sidebar.list_products'), icon: Package },
    { path: '/comments-list', label: t('sidebar.list_comments'), icon: MessageSquare },
    { path: '/notifications', label: t('sidebar.notifications'), icon: Bell },
    { path: '/vouchers', label: t('sidebar.manage_vouchers'), icon: Ticket },
  ]

  return (
    <div
      className={`min-h-screen bg-[#0d1b2a] fixed top-0 left-0 w-64 transition-all duration-300 ease-in-out z-40 border-r border-white/5 shadow-2xl ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:relative md:block`}
    >
      {/* Mobile Header with Close button */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-white/5">
        <span className="text-white font-bold tracking-tight">TECHSHOP ADMIN</span>
        <button
          onClick={() => setSidebarVisible(false)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Desktop Logo Space */}
      <div className="hidden md:flex items-center px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className="text-white font-bold tracking-tight text-lg">TECHSHOP</span>
        </div>
      </div>

      <nav className="mt-2 px-3">
        <p className="px-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Main Menu</p>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              onClick={() => setSidebarVisible(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`
              }
              to={item.path}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="text-[13px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-6 left-0 w-full px-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2">Version</p>
          <p className="text-white text-xs font-medium">TechShop Admin 2.0</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;