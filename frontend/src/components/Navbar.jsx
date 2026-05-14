import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchEngine from './SearchEngine';
import { AppContext } from '../context/AppContext';
import { FaBell, FaShoppingCart, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Package, MessageSquare, Phone, Mail, MapPin, ChevronDown, ShoppingBag, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';

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

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [drawerCartItems, setDrawerCartItems] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTotal, setDrawerTotal] = useState(0);

  useEffect(() => {
    if (showCartDrawer && token) {
      const fetchDrawerCart = async () => {
        setDrawerLoading(true);
        try {
          const { data } = await axios.post(`${backendurl}/api/shopping-cart/get`, {}, { headers: { token } });
          if (data.success) {
            setDrawerCartItems(data.items);
            setDrawerTotal(data.totalPrice);
          }
        } catch (error) {}
        setDrawerLoading(false);
      };
      fetchDrawerCart();
    }
  }, [showCartDrawer, token, backendurl]);

  const updateDrawerQuantity = async (productId, newQty) => {
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/update`, { productId, quantity: newQty }, { headers: { token } });
      if (data.success) {
        setDrawerCartItems(data.items);
        setDrawerTotal(data.totalPrice);
        if (setCartCount) setCartCount(data.totalItems);
      }
    } catch (error) {}
  };

  const removeDrawerItem = async (productId) => {
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/remove`, { productId }, { headers: { token } });
      if (data.success) {
        setDrawerCartItems(data.items);
        setDrawerTotal(data.totalPrice);
        if (setCartCount) setCartCount(data.totalItems);
      }
    } catch (error) {}
  };

  const normalizeLocale = (lng) => {
    if (!lng) return 'vi-VN';
    const base = lng.split('-')[0].toLowerCase();
    return base === 'vi' ? 'vi-VN' : 'en-US';
  };

  const translateNotification = (text) => {
    if (!text) return '';
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

  useEffect(() => {
    if (token) {
      getNotifications();
    } else {
      setCountNewNoti(0);
    }
  }, [token]);

  useEffect(() => {
    const count = (notifications || []).filter(item => !item.isRead).length;
    setCountNewNoti(count);
  }, [notifications]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-neutral-800 text-neutral-300 text-[11px] hidden md:block">
        <div className="container-main flex items-center justify-between py-1">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone size={12} /> Hotline: <strong className="text-white">0862.613.118</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={12} /> tuannv7105@gmail.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FaGlobe size={12} />
              <span className="font-semibold">{i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="header-bg sticky top-0 z-50 shadow-lg">
        <div className="container-main flex items-center justify-between gap-3 py-1.5">
          {/* Logo */}
          <img 
            onClick={() => { navigate('/'); setSearch(''); window.scrollTo(0, 0); }} 
            className="w-24 md:w-28 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" 
            src={assets.logo} 
            alt="Logo" 
          />

          {/* Search Engine - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-4">
            <SearchEngine search={search} setSearch={setSearch} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {token && (
              <>
                {/* Shopping Cart */}
                <div
                  onClick={() => setShowCartDrawer(true)}
                  className="relative cursor-pointer p-2.5 rounded-lg hover:bg-white/10 transition-all text-white flex items-center gap-2"
                >
                  <FaShoppingCart size={20} />
                  <span className="hidden lg:block text-xs font-semibold">Giỏ hàng</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 left-6 lg:left-auto lg:-top-0.5 lg:-right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <div 
                    onClick={() => setShowNotification(!showNotification)}
                    className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-white cursor-pointer"
                  >
                    <FaBell size={18} />
                    {countNewNoti > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {countNewNoti > 9 ? '9+' : countNewNoti}
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {showNotification && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 bg-white border border-neutral-200 rounded-lg shadow-2xl w-80 max-h-[420px] flex flex-col z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                          <h4 className="font-bold text-neutral-900 text-sm">{t('notifications.title')}</h4>
                          <button onClick={markAllAsRead} className="text-xs font-semibold text-primary hover:underline">{t('notifications.mark_all')}</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {(notifications?.length || 0) === 0 ? (
                            <div className="py-10 text-center">
                              <FaBell className="mx-auto text-neutral-200 mb-2" size={28} />
                              <p className="text-sm text-neutral-400">{t('notifications.empty')}</p>
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedNotification(n);
                                  setShowDetailModal(true);
                                  markOneAsRead(n._id);
                                  setShowNotification(false);
                                }}
                                className={`p-3 border-b border-neutral-50 hover:bg-blue-50 cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : ''}`}
                              >
                                <p className="text-xs text-neutral-700 leading-relaxed line-clamp-2">{translateNotification(n.text)}</p>
                                <p className="text-[10px] text-neutral-400 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="group relative">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all text-white">
                    <img className="w-7 h-7 rounded-full border-2 border-white/30" src={userData?.image || assets.avatar} alt="avatar" />
                    <div className="hidden lg:block text-left">
                      <p className="text-[10px] text-neutral-300 leading-none">Xin chào,</p>
                      <p className="text-xs font-bold text-white truncate max-w-[100px]">{userData?.name || 'Tài khoản'}</p>
                    </div>
                    <ChevronDown size={14} className="text-neutral-400 hidden lg:block" />
                  </div>
                  
                  <div className="absolute top-full right-0 pt-2 hidden group-hover:block w-52 z-50">
                    <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 py-1 overflow-hidden">
                      <button onClick={() => navigate('/my-profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-blue-50 hover:text-primary transition-all">
                        <User size={16} /> {t('nav.profile')}
                      </button>
                      <button onClick={() => navigate('/mycart')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-blue-50 hover:text-primary transition-all">
                        <Package size={16} /> {t('nav.orders')}
                      </button>
                      <button onClick={() => navigate('/comments')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-blue-50 hover:text-primary transition-all">
                        <MessageSquare size={16} /> {t('nav.my_comments')}
                      </button>
                      <div className="h-px bg-neutral-100 my-1" />
                      <button onClick={deleteToken} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all">
                        <LogOut size={16} /> {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!token && (
              <button onClick={() => navigate('/login')} className="bg-white text-primary font-bold rounded-lg px-5 py-2 text-sm hover:bg-neutral-100 transition-all">
                {t('nav.login')}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setShowMenu(true)} className="lg:hidden p-2 rounded-lg bg-white/10 text-white">
              <Menu size={22} />
            </button>
          </div>
        </div>

        <div className="bg-primary hidden lg:block">
          <div className="container-main flex items-center">
            {/* Mega Menu Trigger */}
            <div className="group relative px-4 py-1.5 cursor-pointer">
              <span className="text-[13px] font-semibold text-white/80 group-hover:text-white flex items-center gap-1 transition-all">
                Danh mục <ChevronDown size={14} />
              </span>
              <div className="absolute top-full left-0 w-[600px] bg-white rounded-xl shadow-2xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] p-6 grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 border-b pb-2">Thiết bị thông minh</h4>
                  <ul className="space-y-2">
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Điện thoại di động'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Điện thoại di động</button></li>
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Tablet'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Máy tính bảng</button></li>
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Smartwatch'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Đồng hồ thông minh</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 border-b pb-2">Máy tính & Màn hình</h4>
                  <ul className="space-y-2">
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Laptop'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Laptop</button></li>
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Monitors'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Màn hình</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 border-b pb-2">Phụ kiện & Âm thanh</h4>
                  <ul className="space-y-2">
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Tai nghe'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Tai nghe</button></li>
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Loa'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Loa</button></li>
                    <li><button onClick={() => { localStorage.setItem('category', JSON.stringify(['Keyboards'])); navigate('/products'); window.scrollTo(0,0); }} className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Bàn phím & Chuột</button></li>
                  </ul>
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <NavLink 
                key={link.path}
                to={link.path}
                onClick={() => { setSearch(''); window.scrollTo(0, 0); }}
                className={({ isActive }) => `px-4 py-1.5 text-[13px] font-semibold transition-all ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
              <img className="w-32" src={assets.logo} alt="logo" />
              <button onClick={() => setShowMenu(false)} className="p-2 rounded-lg bg-neutral-200 text-neutral-700">
                <X size={22} />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
              <div className="mb-4">
                <SearchEngine search={search} setSearch={setSearch} />
              </div>
              
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <NavLink 
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) => `p-3.5 border-b border-neutral-100 text-base font-semibold ${isActive ? 'text-primary bg-blue-50' : 'text-neutral-800'}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-200">
                <button 
                  onClick={() => { toggleLanguage(); setShowMenu(false); }}
                  className="w-full flex items-center justify-between p-3.5 bg-neutral-100 rounded-lg font-semibold"
                >
                  <span className="flex items-center gap-2"><FaGlobe /> {t('nav.language')}</span>
                  <span className="uppercase text-primary font-bold">{i18n.language}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedNotification && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-neutral-100 text-neutral-500 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">{t('notifications.detail')}</h2>
              <div className="space-y-3 text-neutral-600">
                <p className="text-sm bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <strong className="text-neutral-900 block mb-1 text-xs uppercase tracking-wider">{t('notifications.notify')}</strong>
                  {translateNotification(selectedNotification.text)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <strong className="text-neutral-900 block mb-1 text-xs uppercase tracking-wider">{t('notifications.receiver')}</strong>
                    <span className="text-sm font-semibold">{t('notifications.you')}</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <strong className="text-neutral-900 block mb-1 text-xs uppercase tracking-wider">{t('notifications.time')}</strong>
                    <span className="text-sm font-semibold">{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out Cart Drawer */}
      <AnimatePresence>
        {showCartDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCartDrawer(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-white z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><ShoppingBag size={20} className="text-primary" /> Giỏ hàng ({cartCount})</h2>
                <button onClick={() => setShowCartDrawer(false)} className="p-2 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-full transition-colors"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {drawerLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : drawerCartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag size={48} className="mx-auto text-neutral-200 mb-4" />
                    <p className="text-neutral-500 text-sm">Giỏ hàng của bạn đang trống</p>
                    <button onClick={() => {setShowCartDrawer(false); navigate('/products');}} className="mt-4 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Mua sắm ngay</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {drawerCartItems.map(item => (
                      <div key={item._id} className="flex gap-4 border border-neutral-100 p-3 rounded-xl hover:border-primary/20 hover:shadow-md transition-all relative">
                        <img src={item.product.image_url} alt="" className="w-20 h-20 object-contain bg-neutral-50 rounded-lg p-2" />
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight mb-2 pr-6">{item.product.name}</p>
                          <div className="flex items-center justify-between mt-auto">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 shadow-inner">
                              <button
                                onClick={() => updateDrawerQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 flex items-center justify-center bg-transparent hover:bg-white rounded transition-all disabled:opacity-20 text-neutral-600"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-neutral-800">{item.quantity}</span>
                              <button
                                onClick={() => updateDrawerQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock_quantity}
                                className="w-6 h-6 flex items-center justify-center bg-transparent hover:bg-white rounded transition-all disabled:opacity-20 text-neutral-600"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(item.product.price)}₫</p>
                          </div>
                        </div>
                        {/* Remove button */}
                        <button 
                          onClick={() => removeDrawerItem(item.productId)}
                          className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {drawerCartItems.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-white">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Tổng tạm tính</span>
                    <span className="text-2xl font-black text-primary">{new Intl.NumberFormat('vi-VN').format(drawerTotal)}<span className="text-base">₫</span></span>
                  </div>
                  <button 
                    onClick={() => { setShowCartDrawer(false); navigate('/shopping-cart'); }}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                  >
                    Xem giỏ hàng & Thanh toán <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
