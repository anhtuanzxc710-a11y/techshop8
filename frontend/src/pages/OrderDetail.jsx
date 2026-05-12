import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  ChevronLeft, CreditCard, Receipt, ShoppingBag 
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { backendurl, token, userData } = useContext(AppContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/cart/details/${orderId}`, {
        headers: { token }
      });
      if (data.success) {
        setOrder(data.order);
        return data.order; // Trả về để dùng ngay
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm("Bạn xác nhận đã nhận được kiện hàng này?")) return;
    try {
      console.log("Confirming delivery for order:", orderId);
      const { data } = await axios.post(`${backendurl}/api/cart/confirm-delivered`, { orderId }, { headers: { token } });
      console.log("Confirm response:", data);
      
      if (data.success) {
        toast.success(data.message);
        const updatedOrder = await fetchOrderDetails();
        console.log("Updated order data:", updatedOrder);
        
        if (updatedOrder && updatedOrder.items && updatedOrder.items.length > 0) {
          console.log("Opening review modal for first product:", updatedOrder.items[0]);
          setSelectedProduct(updatedOrder.items[0]);
          setShowReviewModal(true);
        } else {
          console.warn("No items found in updated order to review");
        }
      } else {
        toast.error(data.message || "Không thể xác nhận nhận hàng");
      }
    } catch (error) {
      console.error("Error in handleConfirmReceived:", error);
      toast.error(error.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendurl}/api/comment/create-comment`, {
        productId: selectedProduct.ProductID,
        rating,
        text: comment
      }, { headers: { token } });

      toast.success(data.message || "Cảm ơn bạn đã đánh giá sản phẩm!");
      setShowReviewModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    if (token && orderId) fetchOrderDetails();
  }, [token, orderId]);

  if (loading) return (
    <div className="container-main py-20 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
    </div>
  );

  if (!order) return (
    <div className="container-main py-20 text-center">
      <p className="text-neutral-500">Không tìm thấy đơn hàng</p>
      <button onClick={() => navigate('/mycart')} className="mt-4 btn-primary rounded-full px-6">Quay lại</button>
    </div>
  );

  const statusMap = {
    'pending': { label: 'Chờ xác nhận', color: 'text-amber-500', bg: 'bg-amber-50', icon: <Clock /> },
    'processing': { label: 'Đang xử lý', color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package /> },
    'confirmed': { label: 'Đang xử lý', color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package /> },
    'shipped': { label: 'Đang giao hàng', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <Truck /> },
    'delivered': { label: 'Đã nhận hàng', color: 'text-success', bg: 'bg-green-50', icon: <CheckCircle2 /> },
    'cancelled': { label: 'Đã hủy', color: 'text-error', bg: 'bg-red-50', icon: <ShoppingBag /> },
  };

  const currentStatusString = (order.OrderStatus || 'pending').toLowerCase();
  const currentStatus = statusMap[currentStatusString] || { 
    label: order.OrderStatus, color: 'text-neutral-500', bg: 'bg-neutral-50', icon: <Clock /> 
  };

  return (
    <div className="container-main py-8 lg:py-12">
      <button 
        onClick={() => navigate('/mycart')}
        className="flex items-center gap-2 text-neutral-500 hover:text-primary font-bold mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Quay lại danh sách đơn hàng
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Order Info & Items */}
        <div className="flex-1 space-y-6">
          {/* Status Card */}
          <div className={`${currentStatus.bg} rounded-[32px] p-8 border border-neutral-100 flex items-center justify-between`}>
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Trạng thái đơn hàng</p>
              <h2 className={`text-2xl font-black ${currentStatus.color}`}>{currentStatus.label}</h2>
              <p className="text-neutral-500 text-xs mt-2">Mã đơn hàng: #{order.OrderID}</p>
              
              {order.OrderStatus === 'shipped' && (
                <button 
                  onClick={handleConfirmReceived}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  Xác nhận đã nhận hàng
                </button>
              )}
            </div>
            <div className={`w-16 h-16 rounded-2xl ${currentStatus.color} flex items-center justify-center opacity-20 bg-current scale-110`}>
              {React.cloneElement(currentStatus.icon, { className: "w-8 h-8" })}
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">Sản phẩm đã mua</h3>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-6 border-b border-neutral-50 last:border-0 last:pb-0">
                  <img src={item.ImageURL} alt={item.ProductName} className="w-24 h-24 rounded-2xl bg-neutral-50 border border-neutral-100 object-contain p-2" />
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 leading-tight mb-1">{item.ProductName}</h4>
                    <p className="text-sm text-neutral-500">Số lượng: {item.Quantity}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-black">{new Intl.NumberFormat('vi-VN').format(item.UnitPrice)}₫</p>
                      
                      {order.OrderStatus === 'delivered' && (
                        <button 
                          onClick={() => { setSelectedProduct(item); setShowReviewModal(true); }}
                          className="text-xs font-bold text-primary border-2 border-primary px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                          Đánh giá ngay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Payment */}
        <div className="w-full lg:w-96 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-black text-neutral-900">Địa chỉ giao hàng</h3>
            </div>
            <p className="font-bold text-neutral-800 mb-1">{userData?.name || 'Người nhận'}</p>
            <p className="text-neutral-500 text-sm leading-relaxed">{order.ShippingAddress}</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-neutral-900 rounded-[32px] p-8 text-white shadow-xl shadow-neutral-200">
            <div className="flex items-center gap-3 mb-8">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-black">Chi tiết thanh toán</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-neutral-400 font-medium">
                <span>Tạm tính</span>
                <span>{new Intl.NumberFormat('vi-VN').format(order.SubTotalAmount)}₫</span>
              </div>
              
              {order.DiscountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Giảm giá ({order.VoucherCode})</span>
                  <span className="text-success font-bold">-{new Intl.NumberFormat('vi-VN').format(order.DiscountAmount)}₫</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Phí vận chuyển</span>
                <span className="text-success font-bold">Miễn phí</span>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-between items-end">
                <span className="font-bold">Tổng cộng</span>
                <p className="text-2xl font-black text-primary">{new Intl.NumberFormat('vi-VN').format(order.TotalAmount)}₫</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2 font-bold uppercase tracking-widest">
                <CreditCard className="w-3 h-3" /> Phương thức thanh toán
              </div>
              <p className="font-bold text-sm">{order.PaymentMethod === 'Cash' ? 'Thanh toán khi nhận hàng (COD)' : order.PaymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <h3 className="text-2xl font-black text-neutral-900 mb-2">Đánh giá sản phẩm</h3>
            <p className="text-neutral-500 text-sm mb-8">{selectedProduct?.ProductName}</p>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform active:scale-125 ${star <= rating ? 'text-amber-400' : 'text-neutral-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                className="w-full h-32 rounded-3xl bg-neutral-50 border-none p-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                required
              />

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-4 rounded-full font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
