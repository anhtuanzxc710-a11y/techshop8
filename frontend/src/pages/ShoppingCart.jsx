import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, PackageOpen, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingCart = () => {
  const { backendurl, token, userData, setCartCount, guestCart, addToCart, updateCartItem, removeFromCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!token) {
        setCartItems(guestCart);
        setTotalPrice(guestCart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
        setLoading(false);
        return;
    }
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/get`, {}, { headers: { token } });
      if (data.success) {
        setCartItems(data.items);
        setTotalPrice(data.totalPrice);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    const data = await updateCartItem(productId, newQty);
    if (data && data.success) {
      setCartItems(data.items);
      setTotalPrice(data.totalPrice);
    }
  };

  const removeItem = async (productId) => {
    const data = await removeFromCart(productId);
    if (data && data.success) {
      setCartItems(data.items);
      setTotalPrice(data.totalPrice);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }
    if (!token) {
        toast.info("Vui lòng đăng nhập để thanh toán!");
        navigate('/login', { state: { from: '/shopping-cart' } });
        return;
    }
    navigate('/checkout', { state: { items: cartItems, totalPrice: totalPrice } });
  };

  useEffect(() => {
    fetchCart();
  }, [token, guestCart]);

  if (loading) {
    return (
      <div className="container-main py-32 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Carts are loading...</p>
      </div>
    );
  }

  return (
    <div className="container-main py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-3 tracking-tighter">Giỏ hàng của bạn</h1>
          <p className="text-neutral-400 font-black uppercase text-[10px] tracking-[0.2em]">Hiện có {cartItems.length} sản phẩm trong túi</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="text-neutral-400 hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
        >
          Tiếp tục mua sắm <ArrowRight size={14} />
        </button>
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-24 text-center bg-white rounded-[64px] border-2 border-dashed border-neutral-100 shadow-sm"
        >
          <div className="w-24 h-24 bg-neutral-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-neutral-200" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight">Ồ, giỏ hàng của bạn đang trống!</h2>
          <p className="text-neutral-400 mb-10 max-w-xs mx-auto font-medium leading-relaxed">Đừng để túi trống trải, hãy khám phá các siêu phẩm công nghệ ngay bây giờ.</p>
          <button onClick={() => navigate('/products')} className="btn-primary rounded-[24px] px-12 py-5 font-black text-lg shadow-glow active:scale-95 transition-all">
            Khám phá ngay
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm hover:shadow-premium transition-all group"
                >
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Image */}
                    <div
                      className="w-full sm:w-40 aspect-square bg-neutral-50 rounded-[32px] flex-shrink-0 overflow-hidden border border-neutral-50 p-4 cursor-pointer relative"
                      onClick={() => navigate(`/detail/${item.productId}`)}
                    >
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">{item.product.brand}</span>
                           <h3
                            className="text-xl font-black text-neutral-900 leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2"
                            onClick={() => navigate(`/detail/${item.productId}`)}
                          >
                            {item.product.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-4 text-neutral-300 hover:text-error hover:bg-error-50 rounded-2xl transition-all flex-shrink-0 bg-neutral-50 group-hover:bg-error/5 group-hover:text-error/50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-6 border-t border-neutral-50">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-neutral-100 rounded-2xl p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all disabled:opacity-20 font-black text-lg"
                          >
                            <Minus size={16} strokeWidth={3} />
                          </button>
                          <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all disabled:opacity-20 font-black text-lg"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                           <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Thành tiền</p>
                           <p className="text-2xl font-black text-neutral-900 tracking-tighter">
                            {new Intl.NumberFormat('vi-VN').format(item.product.price * item.quantity)}<span className="text-primary text-sm ml-0.5">₫</span>
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-neutral-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-8 tracking-tight">Chi tiết thanh toán</h3>

                  <div className="space-y-5 mb-10">
                    <div className="flex justify-between items-center text-sm font-medium text-neutral-400">
                      <span className="uppercase tracking-widest text-[10px]">Tạm tính ({cartItems.length} món)</span>
                      <span className="text-white font-bold">{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-neutral-400">
                      <span className="uppercase tracking-widest text-[10px]">Phí vận chuyển</span>
                      <span className="text-success font-black uppercase text-[10px]">Free Shipping</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-neutral-400">
                      <span className="uppercase tracking-widest text-[10px]">Thuế VAT (8%)</span>
                      <span className="text-white font-bold">Bao gồm</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex justify-between items-end mb-10">
                    <div>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Tổng thanh toán</p>
                      <h4 className="text-4xl font-black tracking-tighter">{new Intl.NumberFormat('vi-VN').format(totalPrice)}<span className="text-primary text-xl ml-1">₫</span></h4>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full btn-primary rounded-[24px] py-6 font-black text-lg flex items-center justify-center gap-4 shadow-glow group active:scale-95 transition-all"
                  >
                    Thanh toán ngay
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Trust Section */}
              <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm space-y-6">
                 {[
                   { icon: ShieldCheck, title: "Thanh toán an toàn", desc: "Mã hóa SSL 256-bit" },
                   { icon: Truck, title: "Giao hàng siêu tốc", desc: "Hỗ trợ ship nhanh 2h" },
                   { icon: RefreshCw, title: "30 Ngày đổi trả", desc: "Thủ tục cực kỳ đơn giản" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                       <item.icon size={20} />
                     </div>
                     <div>
                       <h5 className="text-sm font-black text-neutral-900">{item.title}</h5>
                       <p className="text-xs text-neutral-400 font-medium">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;

