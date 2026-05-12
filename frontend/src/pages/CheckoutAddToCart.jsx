import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CreditCard, Truck, MapPin, CheckCircle2, ChevronRight, ShoppingBag, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutAddToCart = () => {
  const navigate = useNavigate();
  const { products, userData, backendurl, token } = useContext(AppContext);
  const location = useLocation();
  const cartData = location.state || JSON.parse(localStorage.getItem('cartData'));
  
  // New: Support both single product (buy now) and full cart checkout
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

  const [address, setAddress] = useState(userData.address || '');
  const [payment, setPayment] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const totalPrice = appliedVoucher ? basePrice - appliedVoucher.discount : basePrice;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidating(true);
    try {
      const response = await axios.post(backendurl + '/api/voucher/validate', {
        code: voucherCode,
        orderAmount: basePrice
      });

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

    setIsSubmitting(true);
    try {
      const payload = {
        userId: userData._id,
        paymentMethod: payment,
        shippingAddress: address,
        voucherCode: appliedVoucher?.code || ""
      };

      if (isFullCart) {
        payload.items = checkoutItems.map(i => ({ productId: i.productId, quantity: i.quantity }));
      } else {
        payload.itemId = cartData.prID;
        payload.totalItems = cartData.quantity;
      }

      const response = await axios.post(backendurl + '/api/cart/create-cart', payload, { headers: { token } });

      if (response.data.success) {
        toast.success("Đặt hàng thành công!");
        // Nếu mua từ giỏ hàng, ta cần xóa sạch giỏ hàng sau khi đặt thành công
        if (isFullCart) {
           await axios.post(`${backendurl}/api/shopping-cart/clear`, {}, { headers: { token } });
        }
        navigate('/mycart', { replace: true });
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

            {/* Voucher Section */}
            <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" /> Mã giảm giá (Voucher)
              </h2>
              {!appliedVoucher ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher (VD: TECH2026)"
                    className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-bold uppercase tracking-wider"
                  />
                  <button
                    onClick={handleValidateVoucher}
                    disabled={isValidating || !voucherCode.trim()}
                    className="px-6 py-3 bg-neutral-900 text-white rounded-2xl font-black text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {isValidating ? '...' : 'Áp dụng'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Đã áp dụng mã</p>
                      <p className="text-sm font-bold text-neutral-900">{appliedVoucher.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-primary">-{new Intl.NumberFormat('vi-VN').format(appliedVoucher.discount)}₫</p>
                    <button onClick={removeVoucher} className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-400 hover:text-error">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" /> Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Cash', 'Pay online'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPayment(method)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      payment === method 
                      ? 'bg-primary-50 border-primary shadow-sm' 
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-4 flex items-center justify-center ${payment === method ? 'border-primary' : 'border-neutral-200'}`}>
                        {payment === method && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <span className={`text-sm font-bold ${payment === method ? 'text-primary' : 'text-neutral-600'}`}>
                        {method === 'Cash' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}
                      </span>
                    </div>
                    {method === 'Pay online' && <CreditCard className={`w-4 h-4 ${payment === method ? 'text-primary' : 'text-neutral-400'}`} />}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-neutral-900 mb-6">Tóm tắt chi phí</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Giá trị sản phẩm</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(basePrice)}₫</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Giảm giá (Voucher)</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(appliedVoucher.discount)}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-success font-bold">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-neutral-100 flex justify-between items-end">
                  <span className="font-bold text-neutral-900">Tổng thanh toán</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary leading-none">
                      {new Intl.NumberFormat('vi-VN').format(totalPrice)}₫
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">(Đã bao gồm VAT)</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddCart}
                disabled={isSubmitting}
                className="w-full btn-primary rounded-2xl py-4 font-black flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 group"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                 <p className="text-[10px] text-neutral-400 leading-relaxed">
                   Bằng việc nhấn nút "Xác nhận đơn hàng", quý khách đồng ý với các chính sách bảo mật và điều khoản giao dịch của chúng tôi.
                 </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddToCart;

