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
  const { backendurl, token } = useContext(AppContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/cart/details/${orderId}`, {
        headers: { token }
      });
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
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
    'confirmed': { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package /> },
    'shipped': { label: 'Đang giao hàng', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <Truck /> },
    'delivered': { label: 'Đã giao hàng', color: 'text-success', bg: 'bg-green-50', icon: <CheckCircle2 /> },
    'cancelled': { label: 'Đã hủy', color: 'text-error', bg: 'bg-red-50', icon: <ShoppingBag /> },
  };

  const currentStatus = statusMap[order.OrderStatus] || statusMap['pending'];

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
                  <img src={item.ImageURL} alt={item.ProductName} className="w-20 h-20 rounded-2xl bg-neutral-50 border border-neutral-100 object-contain p-2" />
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 leading-tight mb-1">{item.ProductName}</h4>
                    <p className="text-sm text-neutral-500">Số lượng: {item.Quantity}</p>
                    <p className="text-primary font-black mt-2">{new Intl.NumberFormat('vi-VN').format(item.UnitPrice)}₫</p>
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
    </div>
  );
};

export default OrderDetail;
