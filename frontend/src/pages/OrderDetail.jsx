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
import { useTranslation } from 'react-i18next';

const OrderDetail = () => {
  const { t, i18n } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { backendurl, token, userData } = useContext(AppContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratedProducts, setRatedProducts] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchUserReviews = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/comment/get-comments`, { headers: { token } });
      if (data.comments) {
        const ratedIds = data.comments
          .filter(c => String(c.orderId) === String(orderId))
          .map(c => c.productId || c.ProductID);
        setRatedProducts(ratedIds);
      }
    } catch (error) {
      console.log("Error fetching user reviews:", error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/cart/details/${orderId}`, {
        headers: { token }
      });
      if (data.success) {
        setOrder(data.order);
        return data.order;
      }
    } catch (error) {
      toast.error(t('order_detail.not_found'));
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm(t('order_detail.confirm_received_msg'))) return;
    try {
      const { data } = await axios.post(`${backendurl}/api/cart/confirm-delivered`, { orderId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        const updatedOrder = await fetchOrderDetails();
        
        // Tự động mở đánh giá cho sản phẩm đầu tiên chưa được đánh giá
        if (updatedOrder && updatedOrder.items && updatedOrder.items.length > 0) {
          const unratedProduct = updatedOrder.items.find(item => !ratedProducts.includes(item.ProductID));
          if (unratedProduct) {
            setSelectedProduct(unratedProduct);
            setShowReviewModal(true);
          }
        }
      } else {
        toast.error(data.message || t('order_detail.not_found'));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendurl}/api/comment/create-comment`, {
        productId: selectedProduct.ProductID,
        orderId: orderId,
        rating,
        text: comment
      }, { headers: { token } });

      toast.success(data.message || t('order_detail.rate_success'));
      setRatedProducts([...ratedProducts, selectedProduct.ProductID]); // Cập nhật state nội bộ
      setShowReviewModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      if (error.response?.data?.error?.toLowerCase().includes("already commented")) {
         setRatedProducts([...ratedProducts, selectedProduct.ProductID]);
         setShowReviewModal(false);
      }
      toast.error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    if (token && orderId) {
      fetchOrderDetails();
      fetchUserReviews();
    }
  }, [token, orderId]);

  if (loading) return (
    <div className="container-main py-20 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
    </div>
  );

  if (!order) return (
    <div className="container-main py-20 text-center">
      <p className="text-neutral-500">{t('order_detail.not_found')}</p>
      <button onClick={() => navigate('/mycart')} className="mt-4 btn-primary rounded-full px-6">{t('order_detail.back')}</button>
    </div>
  );

  const statusMap = {
    'pending': { label: t('order_detail.pending'), color: 'text-amber-500', bg: 'bg-amber-50', icon: <Clock /> },
    'processing': { label: t('order_detail.processing'), color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package /> },
    'confirmed': { label: t('order_detail.confirmed'), color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package /> },
    'shipped': { label: t('order_detail.shipped'), color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <Truck /> },
    'delivered': { label: t('order_detail.delivered'), color: 'text-success', bg: 'bg-green-50', icon: <CheckCircle2 /> },
    'cancelled': { label: t('order_detail.cancelled'), color: 'text-error', bg: 'bg-red-50', icon: <ShoppingBag /> },
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
        <ChevronLeft className="w-5 h-5" /> {t('order.back_to_list')}
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Order Info & Items */}
        <div className="flex-1 space-y-6">
          {/* Status Card */}
          <div className={`${currentStatus.bg} rounded-[32px] p-8 border border-neutral-100 flex items-center justify-between`}>
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">{t('order_detail.status')}</p>
              <h2 className={`text-2xl font-black ${currentStatus.color}`}>{currentStatus.label}</h2>
              <p className="text-neutral-500 text-xs mt-2">{t('order_detail.id')}: #{order.OrderID}</p>
              
              {order.OrderStatus === 'shipped' && (
                <button 
                  onClick={handleConfirmReceived}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  {t('order_detail.confirm_received')}
                </button>
              )}
            </div>
            <div className={`w-16 h-16 rounded-2xl ${currentStatus.color} flex items-center justify-center opacity-20 bg-current scale-110`}>
              {React.cloneElement(currentStatus.icon, { className: "w-8 h-8" })}
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">{t('order_detail.purchased_products')}</h3>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-6 border-b border-neutral-50 last:border-0 last:pb-0">
                  <img src={item.ImageURL} alt={item.ProductName} className="w-24 h-24 rounded-2xl bg-neutral-50 border border-neutral-100 object-contain p-2" />
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 leading-tight mb-1">{item.ProductName}</h4>
                    <p className="text-sm text-neutral-500">{t('order_detail.quantity')}: {item.Quantity}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-black">{new Intl.NumberFormat('vi-VN').format(item.UnitPrice)}₫</p>
                      
                      {order.OrderStatus === 'delivered' && !ratedProducts.includes(item.ProductID) && (
                        <button 
                          onClick={() => { setSelectedProduct(item); setShowReviewModal(true); }}
                          className="text-xs font-bold text-primary border-2 border-primary px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                          {t('order_detail.rate_now')}
                        </button>
                      )}
                      
                      {order.OrderStatus === 'delivered' && ratedProducts.includes(item.ProductID) && (
                        <span className="text-xs font-bold text-neutral-400 border-2 border-neutral-200 px-4 py-1.5 rounded-full bg-neutral-50 cursor-not-allowed">
                          {t('order_detail.rated')}
                        </span>
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
              <h3 className="text-xl font-black text-neutral-900">{t('order_detail.shipping_address')}</h3>
            </div>
            <p className="font-bold text-neutral-800 mb-1">{userData?.name || t('notifications.receiver')}</p>
            <p className="text-neutral-500 text-sm leading-relaxed">{order.ShippingAddress}</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-neutral-900 rounded-[32px] p-8 text-white shadow-xl shadow-neutral-200">
            <div className="flex items-center gap-3 mb-8">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-black">{t('order_detail.payment_details')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-neutral-400 font-medium">
                <span>{t('order_detail.subtotal')}</span>
                <span>{new Intl.NumberFormat('vi-VN').format(order.SubTotalAmount)}₫</span>
              </div>
              
              {order.DiscountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">{t('order_detail.discount')} ({order.VoucherCode})</span>
                  <span className="text-success font-bold">-{new Intl.NumberFormat('vi-VN').format(order.DiscountAmount)}₫</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{t('order_detail.shipping_fee')}</span>
                <span className="text-success font-bold">{t('cart.free')}</span>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-between items-end">
                <span className="font-bold">{t('order_detail.total')}</span>
                <p className="text-2xl font-black text-primary">{new Intl.NumberFormat('vi-VN').format(order.TotalAmount)}₫</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2 font-bold uppercase tracking-widest">
                <CreditCard className="w-3 h-3" /> {t('order_detail.payment_method')}
              </div>
              <p className="font-bold text-sm">{order.PaymentMethod === 'Cash' ? t('order_detail.cod') : order.PaymentMethod}</p>
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
            <h3 className="text-2xl font-black text-neutral-900 mb-2">{t('order_detail.rate_product')}</h3>
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
                placeholder={t('order_detail.share_experience')}
                className="w-full h-32 rounded-3xl bg-neutral-50 border-none p-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                required
              />

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-4 rounded-full font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                >
                  {t('order_detail.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  {t('order_detail.submit_review')}
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

