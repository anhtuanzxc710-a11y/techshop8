import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Truck, Trash2, CreditCard, Calendar, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { backendurl, token } = useContext(AppContext);
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const navigate = useNavigate();

  const getMyCart = async () => {
    try {
      const response = await axios.post(`${backendurl}/api/cart/list-mycart`, {}, {
        headers: { token },
      });
      if (response.data) {
        setCart(response.data.cartData || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.post(
        `${backendurl}/api/cart/cancel-order`,
        { orderId: deleteItemId },
        { headers: { token } }
      );
      if (response.status === 200) {
        toast.success("Đã xóa đơn hàng");
        await getMyCart();
      }
      setDeleteItemId('');
      setShowConfirm(false);
    } catch (error) {
      toast.error("Không thể xóa đơn hàng");
      setShowConfirm(false);
    }
  };

  const handlePayment = async (item) => {
    try {
      const response = await axios.post(`${backendurl}/api/user/pay-cart`,
        { cart: item },
        { headers: { token } }
      );
      const paymentUrl = response.data?.order_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Không tìm thấy link thanh toán");
      }
    } catch (error) {
      toast.error("Thanh toán thất bại");
    }
  };

  useEffect(() => {
    if (token) getMyCart();
  }, [token, backendurl]);

  const getStatusBadge = (item) => {
    if (item.status === 'processing') {
      return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Đang xử lý
      </span>;
    }
    if (item.status === 'shipped' || item.paymentStatus === true) {
      return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-success bg-success-50 px-3 py-1 rounded-full border border-success-100">
        <CheckCircle2 className="w-3 h-3" /> Hoàn thành
      </span>;
    }
    return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-error bg-error-50 px-3 py-1 rounded-full border border-error-100">
      <XCircle className="w-3 h-3" /> Đã hủy
    </span>;
  };

  if (!token) return null;

  return (
    <div className="container-main py-10 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 mb-2">Lịch sử đơn hàng</h1>
          <p className="text-neutral-500 font-medium">Quản lý và theo dõi các thiết bị bạn đã đặt mua.</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="btn-primary btn-sm rounded-xl px-6 py-3"
        >
          Tiếp tục mua sắm
        </button>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cart.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item._id}
              className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/40 transition-all group"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 bg-neutral-50 rounded-2xl flex-shrink-0 overflow-hidden border border-neutral-50 p-2">
                  <img
                    src={item.itemData.image_url}
                    alt={item.itemData.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 
                      onClick={() => navigate(`/order-detail/${item._id}`)}
                      className="font-bold text-neutral-900 leading-tight group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.itemData.name}
                    </h3>
                    {getStatusBadge(item)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-neutral-500">
                    <div className="flex items-center gap-2"><ShoppingBag className="w-3.5 h-3.5" /> SL: {item.totalItems}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(new Date(item.deliveryDate).getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</div>
                  </div>

                  <div className="pt-3 border-t border-neutral-50 flex items-center justify-between">
                    <p className="text-lg font-black text-primary">
                      {new Intl.NumberFormat('vi-VN').format(item.totalPrice)}₫
                    </p>
                    <div className="flex items-center gap-2">
                      {item.status === 'processing' && !item.paymentStatus && (
                        <button
                          onClick={() => handlePayment(item)}
                          className="btn-primary btn-sm rounded-lg px-4 flex items-center gap-2 shadow-glow"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Thanh toán
                        </button>
                      )}
                      {item.paymentStatus && (
                        <div className="px-3 py-1.5 bg-success-50 text-success text-[10px] font-black rounded-lg border border-success-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ĐÃ THANH TOÁN
                        </div>
                      )}
                      {(item.status === 'cancelled' || item.status === 'processing') && (
                        <button
                          onClick={() => {
                            setDeleteItemId(item._id);
                            setShowConfirm(true);
                          }}
                          className="p-2 text-neutral-400 hover:text-error hover:bg-error-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[48px] border border-dashed border-neutral-200">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-neutral-300" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Các thiết bị bạn đặt mua sẽ xuất hiện tại đây để dễ dàng theo dõi.</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary rounded-full px-10 py-4 font-black shadow-glow"
          >
            Bắt đầu mua sắm ngay
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-2">Xác nhận xóa</h3>
              <p className="text-neutral-500 mb-8">Bạn có chắc chắn muốn xóa đơn hàng này khỏi danh sách không?</p>
              <div className="flex gap-4">
                <button
                  className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black transition-colors"
                  onClick={() => setShowConfirm(false)}
                >
                  Hủy
                </button>
                <button
                  className="flex-1 py-4 bg-error text-white rounded-2xl font-black shadow-lg shadow-error/30 hover:bg-error-600 transition-colors"
                  onClick={handleDelete}
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;

