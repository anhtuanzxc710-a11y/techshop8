import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Search from './Search'
import { HiMenuAlt3 } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { FaGlobe } from 'react-icons/fa'

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
        <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
            {/* Logo */}
            <div className="flex items-center gap-2 text-xs">
                <img
                    onClick={() => {
                        navigate('/')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-32 md:w-48 cursor-pointer"
                    src={assets.admin_logo}
                    alt="Logo"
                />
                <p className="border px-1 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs md:text-md">
                    Admin
                </p>
            </div>

            {/* Search bar */}
            <div className="text-sm hidden md:block">
                <Search search={search} setSearch={setSearch} />
            </div>

            {/* Container for logout button and hamburger icon */}
            <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-all"
                >
                    <FaGlobe className="text-blue-500" />
                    <span className="text-[10px] font-black">{i18n.language.toUpperCase()}</span>
                </button>

                {/* Logout button */}
                <button
                    onClick={logout}
                    className="bg-blue-500 text-white px-2 ml-3 md:px-8 py-2 md:py-2 rounded-full hover:cursor-pointer text-xs md:text-sm"
                >
                    {t('common.logout')}
                </button>

                {/* Biểu tượng hamburger nhỏ nằm đằng sau logout */}
                <button onClick={() => setSidebarVisible(prev => !prev)} className="text-xl text-gray-700 md:hidden">
                    <HiMenuAlt3 /> {/* Hamburger icon */}
                </button>
            </div>
        </div>
    )
}

export default Navbar