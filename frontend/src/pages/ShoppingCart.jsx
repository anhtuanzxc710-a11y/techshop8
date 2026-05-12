import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingCart = () => {
  const { backendurl, token, userData } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
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
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/update`, { productId, quantity: newQty }, { headers: { token } });
      if (data.success) {
        setCartItems(data.items);
        setTotalPrice(data.totalPrice);
      }
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/remove`, { productId }, { headers: { token } });
      if (data.success) {
        setCartItems(data.items);
        setTotalPrice(data.totalPrice);
        toast.success("Đã xóa khỏi giỏ hàng");
      }
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }
    navigate('/checkout', { state: { items: cartItems, totalPrice: totalPrice } });
  };

  useEffect(() => {
    if (token) fetchCart();
    else setLoading(false);
  }, [token]);

  if (!token) {
    return (
      <div className="container-main py-20 text-center">
        <PackageOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-neutral-900 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-neutral-500 mb-6">Đăng nhập để xem giỏ hàng của bạn</p>
        <button onClick={() => navigate('/login')} className="btn-primary rounded-full px-8">Đăng nhập</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-main py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-neutral-500">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="container-main py-8 lg:py-12">
      <h1 className="text-3xl font-black text-neutral-900 mb-2">Giỏ hàng của bạn</h1>
      <p className="text-neutral-500 font-medium mb-8">{cartItems.length} sản phẩm trong giỏ</p>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[48px] border border-dashed border-neutral-200">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-neutral-300" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Hãy thêm sản phẩm yêu thích vào giỏ hàng của bạn!</p>
          <button onClick={() => navigate('/products')} className="btn-primary rounded-full px-10 py-4 font-black shadow-glow">
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[24px] p-5 border border-neutral-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="flex gap-5">
                    {/* Image */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-neutral-50 rounded-2xl flex-shrink-0 overflow-hidden border border-neutral-100 p-2 cursor-pointer"
                      onClick={() => navigate(`/detail/${item.productId}`)}
                    >
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="font-bold text-neutral-900 leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2"
                            onClick={() => navigate(`/detail/${item.productId}`)}
                          >
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-error-50 rounded-xl transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium mt-1">{item.product.brand} • {item.product.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="px-3 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-lg font-black text-primary">
                          {new Intl.NumberFormat('vi-VN').format(item.product.price * item.quantity)}₫
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-neutral-900 mb-6">Tóm tắt đơn hàng</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-neutral-500 truncate max-w-[200px]">{item.product.name} x{item.quantity}</span>
                    <span className="font-bold text-neutral-700">{new Intl.NumberFormat('vi-VN').format(item.product.price * item.quantity)}₫</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</span>
                </div>
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-success font-bold">Miễn phí</span>
                </div>
                <div className="pt-3 border-t border-neutral-100 flex justify-between items-end">
                  <span className="font-bold text-neutral-900">Tổng</span>
                  <p className="text-2xl font-black text-primary">{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary rounded-2xl py-4 mt-8 font-black flex items-center justify-center gap-3 shadow-glow group"
              >
                Tiến hành đặt hàng
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full text-center mt-4 text-sm text-primary font-bold hover:underline"
              >
                ← Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
