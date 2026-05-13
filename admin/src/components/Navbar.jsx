import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Search from './Search'
import { useTranslation } from 'react-i18next'
import { Globe, LogOut, Menu, User } from 'lucide-react'

const Navbar = ({ setSidebarVisible }) => {
    const { aToken, setAToken, search, setSearch } = useContext(AdminContext)
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const toggleLanguage = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
    };

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
    }

    return (
        <div className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-8 py-3 bg-white border-b border-neutral-200 shadow-sm">
            {/* Logo area for Mobile, Desktop has it in Sidebar */}
            <div className="flex items-center gap-3 md:hidden">
                <button onClick={() => setSidebarVisible(prev => !prev)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
                    <Menu size={20} />
                </button>
                <img className="w-24" src={assets.admin_logo} alt="Logo" />
            </div>

            {/* Title / Search bar section */}
            <div className="hidden md:flex items-center gap-6 flex-1">
                <h1 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Trang Quản Trị</h1>
                <div className="max-w-md w-full">
                    <Search search={search} setSearch={setSearch} />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Language Switcher */}
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-all text-neutral-600"
                >
                    <Globe size={14} className="text-primary" />
                    <span className="text-[11px] font-bold uppercase">{i18n.language}</span>
                </button>

                {/* Profile / Logout */}
                <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-neutral-200">
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-[11px] font-bold text-neutral-900 leading-none">Admin</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Administrator</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                        title={t('common.logout')}
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar