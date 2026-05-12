import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CreditCard, Truck, MapPin, CheckCircle2, ChevronRight, ShoppingBag, Tag, X, QrCode, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutAddToCart = () => {
  const navigate = useNavigate();
  const { products, userData, backendurl, token } = useContext(AppContext);
  const location = useLocation();
  const cartData = location.state || JSON.parse(localStorage.getItem('cartData'));
  
  const isFullCart = Array.isArray(cartData?.items);
  const checkoutItems = isFullCart 
    ? cartData.items 
    : [{ 
        productId: cartData.prID, 
        quantity: cartData.quantity,
        product: products.find(p => String(p._id) === String(cartData.prID))
      }];

  const basePrice = isFullCart 
    ? cartData.totalPrice 
    : (checkoutItems[0].product ? checkoutItems[0].product.price * checkoutItems[0].quantity : 0);

  const [address, setAddress] = useState(userData?.address || '');
  const [payment, setPayment] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // States for QR Payment
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const totalPrice = appliedVoucher ? basePrice - appliedVoucher.discount : basePrice;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidating(true);
    try {
      const response = await axios.post(backendurl + '/api/voucher/validate', {
        code: voucherCode,
        orderAmount: basePrice
      }, { headers: { token } });

      if (response.data.success) {
        setAppliedVoucher({
          code: response.data.voucherCode,
          discount: response.data.discount
        });
        toast.success("Mã giảm giá đã được áp dụng!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Không thể kiểm tra mã giảm giá");
    } finally {
      setIsValidating(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const handleAddCart = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }
    if (!address.trim()) {
      toast.warning("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if (payment === 'Card') {
      toast.info("Tính năng thanh toán bằng thẻ (Stripe) đang được cập nhật. Vui lòng chọn phương thức khác.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: userData?._id,
        paymentMethod: payment,
        shippingAddress: address,
        voucherCode: appliedVoucher?.code || "",
        subTotal: basePrice,
        discountAmount: appliedVoucher?.discount || 0,
        totalAmount: totalPrice
      };

      if (isFullCart) {
        payload.items = checkoutItems.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.product.price }));
      } else {
        payload.itemId = cartData.prID;
        payload.totalItems = cartData.quantity;
      }

      const response = await axios.post(backendurl + '/api/cart/create-cart', payload, { headers: { token } });

      if (response.data.success) {
        // Clear cart if needed
        if (isFullCart) {
           await axios.post(`${backendurl}/api/shopping-cart/clear`, {}, { headers: { token } });
        }

        if (payment === 'ZaloPay') {
          try {
             // Create mock cart payload expected by ZaloPay controller
             const zaloPayload = {
                cart: {
                   _id: response.data.cartData.OrderID,
                   userData: { name: userData?.name || "Khách hàng" },
                   totalPrice: totalPrice,
                   totalItems: isFullCart ? checkoutItems.length : cartData.quantity,
                   itemData: { 
                      name: isFullCart ? "Đơn hàng TechShop" : checkoutItems[0].product?.name || "Sản phẩm", 
                      price: totalPrice 
                   }
                }
             };
             
             const zaloRes = await axios.post(backendurl + '/api/user/pay-cart', zaloPayload, { headers: { token } });
             if (zaloRes.data.success && zaloRes.data.order_url) {
                // Redirect straight to ZaloPay secure payment gateway
                window.location.href = zaloRes.data.order_url;
                return;
             } else {
                toast.error("Không thể khởi tạo cổng thanh toán ZaloPay.");
                navigate('/mycart', { replace: true });
             }
          } catch (err) {
             toast.error("Lỗi kết nối cổng thanh toán.");
             navigate('/mycart', { replace: true });
          }
        } else {
          toast.success("Đặt hàng thành công!");
          navigate('/mycart', { replace: true });
        }
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  const paymentOptions = [
    { id: 'Cash', label: 'Thanh toán khi nhận hàng (COD)', icon: <Truck className="w-4 h-4" />, color: 'text-amber-500' },
    { id: 'ZaloPay', label: 'Thanh toán qua ZaloPay / Thẻ ATM / QR', icon: <QrCode className="w-4 h-4" />, color: 'text-blue-500', isHot: true },
    { id: 'Card', label: 'Thẻ tín dụng quốc tế (Visa/Master)', icon: <CreditCard className="w-4 h-4" />, color: 'text-indigo-500' }
  ];

  return (
    <div className="container-main py-10 lg:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-8">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/mycart')}>Giỏ hàng</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900 font-bold">Xác nhận đơn hàng</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Summary */}
            <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" /> Thông tin sản phẩm
              </h2>
              <div className="space-y-4">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-6 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                    <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 overflow-hidden border border-neutral-100">
                      <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-neutral-900 mb-1">{item.product?.name}</h3>
                      <p className="text-[10px] text-neutral-500 mb-2">Thương hiệu: <span className="font-bold text-neutral-700">{item.product?.brand}</span></p>
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <span className="text-[10px] font-bold text-neutral-400">Số lượng: {item.quantity}</span>
                        <span className="text-primary font-black text-sm">{new Intl.NumberFormat('vi-VN').format(item.product?.price || 0)}₫</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Info */}
            <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" /> Thông tin giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Địa chỉ nhận hàng</label>
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium resize-none"
                  />
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Miễn phí vận chuyển cho đơn hàng này. Thời gian giao hàng dự kiến từ 2-4 ngày làm việc.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" /> Phương thức thanh toán
              </h2>
              <div className="flex flex-col gap-4">
                {paymentOptions.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPayment(method.id)}
                    className={`relative flex items-center p-4 rounded-2xl border transition-all overflow-hidden ${
                      payment === method.id 
                      ? 'bg-primary-50 border-primary shadow-sm' 
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {payment === method.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                    )}
                    <div className="flex items-center gap-4 w-full ml-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment === method.id ? 'bg-white text-primary shadow-sm' : 'bg-neutral-50 text-neutral-500'}`}>
                        {method.icon}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-bold ${payment === method.id ? 'text-primary' : 'text-neutral-700'}`}>
                          {method.label}
                        </span>
                        {method.id === 'ZaloPay' && <span className="text-[10px] text-neutral-500 font-medium">Chuyển hướng đến cổng thanh toán an toàn ZaloPay</span>}
                      </div>
                      
                      {method.isHot && (
                        <div className="ml-auto bg-error/10 text-error text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                          Khuyên dùng
                        </div>
                      )}
                      
                      {payment === method.id && !method.isHot && (
                        <div className="ml-auto">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-neutral-900 mb-6">Tóm tắt chi phí</h3>
              
              {/* Voucher Input Sidebar */}
              <div className="mb-6 pb-6 border-b border-neutral-100">
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Mã giảm giá..."
                      className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-primary focus:border-primary transition-all text-xs font-bold uppercase"
                    />
                    <button
                      onClick={handleValidateVoucher}
                      disabled={isValidating || !voucherCode.trim()}
                      className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {isValidating ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase">Đã áp dụng mã</p>
                        <p className="text-xs font-bold text-neutral-900">{appliedVoucher.code}</p>
                      </div>
                    </div>
                    <button onClick={removeVoucher} className="p-1.5 hover:bg-white rounded-lg text-neutral-400 hover:text-error">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-neutral-500 font-medium text-sm">
                  <span>Giá trị sản phẩm</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(basePrice)}₫</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-primary font-medium text-sm">
                    <span>Giảm giá</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(appliedVoucher.discount)}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 font-medium text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-success font-bold">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-neutral-100 flex justify-between items-end">
                  <span className="font-bold text-neutral-900">Tổng thanh toán</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary leading-none">
                      {new Intl.NumberFormat('vi-VN').format(totalPrice)}₫
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddCart}
                disabled={isSubmitting}
                className="w-full btn-primary rounded-2xl py-4 font-black flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 group"
              >
                {isSubmitting ? 'Đang xử lý...' : (payment === 'ZaloPay' ? 'Thanh toán với ZaloPay' : 'Xác nhận đặt hàng')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddToCart;

