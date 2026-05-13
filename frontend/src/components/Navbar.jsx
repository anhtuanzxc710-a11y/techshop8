import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchEngine from './SearchEngine';
import { AppContext } from '../context/AppContext';
import { FaBell, FaShoppingCart, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    token, setToken, backendurl, userData,
    search, setSearch,
    getNotifications, notifications, markOneAsRead, markAllAsRead,
    cartCount
  } = useContext(AppContext);

  const [showNotification, setShowNotification] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [countNewNoti, setCountNewNoti] = useState(0);

  const normalizeLocale = (lng) => {
    if (!lng) return 'vi-VN';
    const base = lng.split('-')[0].toLowerCase();
    return base === 'vi' ? 'vi-VN' : 'en-US';
  };

  const translateNotification = (text) => {
    if (!text) return '';
    
    // Pattern for updated cart: "The cart (id: #30) that has 1 item(s) of [Name] was updated to [Status] by admin."
    const updateRegex = /The cart \(id: #(\d+)\) that has (\d+) item\(s\) of (.*) was updated to (.*) by admin\./i;
    const updateMatch = text.match(updateRegex);
    if (updateMatch) {
      return t('orders.noti_updated', {
        id: updateMatch[1],
        items: updateMatch[2],
        name: updateMatch[3],
        status: t(`orders.${updateMatch[4].toLowerCase()}`)
      });
    }

    // Pattern for deleted cart: "The cart (id: #30) that has 1 item(s) of [Name] you ordered has been deleted by admin."
    const deleteRegex = /The cart \(id: #(\d+)\) that has (\d+) item\(s\) of (.*) you ordered has been deleted by admin\./i;
    const deleteMatch = text.match(deleteRegex);
    if (deleteMatch) {
      return t('orders.noti_deleted', {
        id: deleteMatch[1],
        items: deleteMatch[2],
        name: deleteMatch[3]
      });
    }

    return text;
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const deleteToken = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const countNewNotifications = () => {
    const count = (notifications || []).filter(item => !item.isRead).length;
    setCountNewNoti(count);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        await getNotifications();
        countNewNotifications();
      } else {
        setCountNewNoti(0); // reset nếu không có token
      }
    };
    fetchData();
  }, [token, markAllAsRead, markOneAsRead]);

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 relative z-50'>
      <img onClick={() => { navigate('/'); setSearch(''); scrollTo(0,0); }} className='w-28 md:w-40 cursor-pointer' src={assets.logo} alt="Our logo" />

      <ul className='hidden md:flex items-start gap-6 font-medium text-sm'>
        <NavLink onClick={() => { setSearch(''); scrollTo(0,0) }} className='p-2 hover:bg-gray-100 rounded-md w-20 text-center' to='/'>
          <li className='py-1'>{t('nav.home')}</li>
        </NavLink>
        <NavLink onClick={() => { setSearch(''); scrollTo(0,0) }} className='p-2 hover:bg-gray-100 rounded-md w-32 text-center' to='/products'>
          <li className='py-1'>{t('nav.products')}</li>
        </NavLink>
        <NavLink onClick={() => { setSearch(''); scrollTo(0,0) }} className='p-2 hover:bg-gray-100 rounded-md w-20 text-center' to='/about'>
          <li className='py-1'>{t('nav.about')}</li>
        </NavLink>
        <NavLink onClick={() => { setSearch(''); scrollTo(0,0) }} className='p-2 hover:bg-gray-100 rounded-md w-24 text-center' to='/contact'>
          <li className='py-1'>{t('nav.contact')}</li>
        </NavLink>
      </ul>

      <div className='md:block hidden'>
        <SearchEngine className='md:block hidden' search={search} setSearch={setSearch} />
      </div>

      <img onClick={() => setShowMenu(true)} className='md:hidden w-4' src={assets.menu_icon} alt="menu" />

      {/* Mobile Menu */}
      <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
        <div className='flex items-center justify-between px-5 py-6'>
          <img className='w-36' src={assets.logo} alt="logo" />
          <img className='w-7' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt='close' />
        </div>
        <ul className='flex flex-col items-center gap-2 mt-5 px-5 font-medium text-lg'>
          <SearchEngine className='md:block hidden' search={search} setSearch={setSearch} />
          <NavLink onClick={() => { setShowMenu(false); setSearch(''); scrollTo(0,0); }} to='/'><p className='px-4 py-2 rounded'>{t('nav.home')}</p></NavLink>
          <NavLink onClick={() => { setShowMenu(false); setSearch(''); scrollTo(0,0); }} to='/products'><p className='px-4 py-2 rounded'>{t('nav.products')}</p></NavLink>
          <NavLink onClick={() => { setShowMenu(false); setSearch(''); scrollTo(0,0); }} to='/about'><p className='px-4 py-2 rounded'>{t('nav.about')}</p></NavLink>
          <NavLink onClick={() => { setShowMenu(false); setSearch(''); scrollTo(0,0); }} to='/contact'><p className='px-4 py-2 rounded'>{t('nav.contact')}</p></NavLink>
          
          <div onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full cursor-pointer mt-4">
            <FaGlobe />
            <span className="font-bold">{i18n.language.toUpperCase()}</span>
          </div>
        </ul>
      </div>

      <div className='flex items-center gap-2 md:gap-4'>
        {/* Language Switcher Desktop */}
        <div 
          onClick={toggleLanguage}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 transition-all group"
        >
          <FaGlobe className="text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            {i18n.language === 'vi' ? 'VI' : 'EN'}
          </span>
        </div>

        {/* My Cart */}
        {token && (
          <div
            onClick={() => navigate('/shopping-cart')}
            className="relative cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
            title={t('cart.title')}
          >
            <FaShoppingCart className="text-[22px] text-gray-700 hover:text-blue-500 w-4 md:w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
        )}

        {/* Notifications */}
        {token && (
          <div className="relative">
            <FaBell
              className="w-4 md:w-6 h-6 cursor-pointer text-gray-700 hover:text-primary transition duration-200"
              onClick={() => setShowNotification(prev => !prev)}
            />
            {countNewNoti > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {countNewNoti > 9 ? '9+' : countNewNoti}
              </span>
            )}
            {showNotification && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-80 max-h-96 flex flex-col z-50">
                <div className="flex-1 overflow-y-auto">
                  {(notifications?.length || 0) === 0 ? (
                    <p className="p-4 text-gray-500">{t('notifications.empty')}</p>
                  ) : (
                    notifications.slice(0, 15).map((n, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedNotification(n);
                          setShowDetailModal(true);
                          markOneAsRead(n._id);
                        }}
                        className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${n.isRead ? 'bg-gray-200' : 'bg-white'}`}
                      >
                        <p className="font-semibold text-sm">
                          {n.isRead ? t('notifications.old') : <strong className='text-blue-500'>{t('notifications.new')}</strong>}
                        </p>
                        <p className="text-xs text-gray-700">{translateNotification(n.text)}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-center p-2 border-t bg-white">
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    {t('notifications.mark_all')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avatar & User Menu */}
        {token ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-7 md:w-10 rounded-full' src={userData?.image || assets.avatar} alt='avatar' />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 hidden group-hover:block'>
              <div className='min-w-48 round flex flex-col gap-2 p-4 bg-gray-50 font-bold text-black'>
                <p onClick={() => navigate('/my-profile')} className='hover:bg-blue-400 hover:text-white px-2 py-2 cursor-pointer'>{t('nav.profile')}</p>
                <p onClick={() => navigate('/mycart')} className='hover:bg-blue-400 hover:text-white px-2 py-2 cursor-pointer'>{t('nav.orders')}</p>
                <p onClick={() => navigate('/comments')} className='hover:bg-blue-400 hover:text-white px-2 py-2 cursor-pointer'>{t('nav.my_comments')}</p>
                <p onClick={deleteToken} className='hover:bg-blue-400 hover:text-white px-2 py-2 cursor-pointer'>{t('nav.logout')}</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-4 py-2 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-md'>
            {t('nav.login')}
          </button>
        )}
      </div>

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-md p-6 w-[600px] h-auto max-w-full shadow-lg relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-3xl font-bold mb-5">{t('notifications.detail')}</h2>
            <p className='text-lg mb-1'><strong>ID:</strong> {selectedNotification._id}</p>
            <p className='text-lg mb-1'><strong>{t('notifications.receiver')}:</strong> {t('notifications.you')}</p>
            <p className='text-lg mb-1'><strong>{t('notifications.by')}:</strong> {t('notifications.admin')}</p>
            <p className='text-lg mb-1 text-red-500'><strong>{t('notifications.notify')}:</strong> {translateNotification(selectedNotification.text)}</p>
            <p className='text-lg'><strong>{t('notifications.time')}:</strong> {new Date(selectedNotification.createdAt).toLocaleString(normalizeLocale(i18n.language), { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

