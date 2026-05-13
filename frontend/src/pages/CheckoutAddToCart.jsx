import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CreditCard, Truck, MapPin, CheckCircle2, ChevronRight, ShoppingBag, Tag, X, QrCode, Building2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { assets } from '../assets/assets';

const CheckoutAddToCart = () => {
  const { t, i18n } = useTranslation();
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

  // States for QR/Success Modal
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
        toast.success(t('checkout.voucher_applied'));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(t('vouchers.error'));
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
      toast.error(t('common.login_required'));
      return;
    }
    if (!address.trim()) {
      toast.warning(t('checkout.address_required'));
      return;
    }

    if (payment === 'Card') {
      toast.info(t('checkout.card_unavailable'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: userData?._id,
        paymentMethod: payment === 'BankTransfer' ? 'Chuyển khoản ngân hàng' : payment,
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
        if (isFullCart) {
           await axios.post(`${backendurl}/api/shopping-cart/clear`, {}, { headers: { token } });
        }

        if (payment === 'ZaloPay') {
          try {
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
                window.location.href = zaloRes.data.order_url;
                return;
             } else {
                toast.error(t('checkout.zalopay_error'));
                navigate('/mycart', { replace: true });
             }
          } catch (err) {
             toast.error(t('order_detail.submit_error'));
             navigate('/mycart', { replace: true });
          }
        } else if (payment === 'BankTransfer') {
          setShowModal(true);
        } else {
          toast.success(t('common.order_success'));
          navigate('/mycart', { replace: true });
        }
      } else {
        toast.error(response.data.message || t('common.submit_error'));
      }
    } catch (error) {
      toast.error(t('common.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép!");
  };

  if (!token) return null;

  const paymentOptions = [
    { id: 'Cash', label: t('checkout.cod'), icon: <Truck className="w-4 h-4" />, color: 'text-amber-500' },
    { id: 'BankTransfer', label: "Chuyển khoản ngân hàng", icon: <Building2 className="w-4 h-4" />, color: 'text-blue-600', isHot: true },
    { id: 'ZaloPay', label: t('checkout.zalopay'), icon: <QrCode className="w-4 h-4" />, color: 'text-blue-500' },
    { id: 'Card', label: t('checkout.card'), icon: <CreditCard className="w-4 h-4" />, color: 'text-indigo-500' }
  ];

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container-main py-10 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-8">
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/mycart')}>Đơn hàng</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 font-bold">Thanh toán</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <ShoppingBag className="text-primary" size={20} /> Thông tin sản phẩm
                </h2>
                <div className="space-y-4">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="w-16 h-16 bg-white rounded-xl border border-neutral-100 flex-shrink-0 overflow-hidden p-2">
                        <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-neutral-800 truncate">{item.product?.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[11px] text-neutral-500 font-medium">SL: {item.quantity}</span>
                          <span className="text-primary font-bold text-sm">{new Intl.NumberFormat('vi-VN').format(item.product?.price || 0)}₫</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <MapPin className="text-primary" size={20} /> Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Địa chỉ nhận hàng</label>
                    <textarea
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <CreditCard className="text-primary" size={20} /> Phương thức thanh toán
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentOptions.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPayment(method.id)}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        payment === method.id 
                        ? 'bg-blue-50/50 border-primary ring-1 ring-primary/20 shadow-sm' 
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment === method.id ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                        {method.icon}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${payment === method.id ? 'text-primary' : 'text-neutral-800'}`}>{method.label}</p>
                        {method.isHot && <span className="text-[10px] text-primary font-bold animate-pulse">Khuyên dùng</span>}
                      </div>
                      {payment === method.id && <CheckCircle2 className="ml-auto text-primary" size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 border-b border-neutral-50 pb-4">Tổng cộng đơn hàng</h3>
                
                {/* Voucher Section */}
                <div className="mb-6">
                  {!appliedVoucher ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Mã giảm giá"
                        className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all text-xs font-bold uppercase"
                      />
                      <button
                        onClick={handleValidateVoucher}
                        disabled={isValidating || !voucherCode.trim()}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        Áp dụng
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Tag size={16} />
                        <span className="text-xs font-bold">{appliedVoucher.code}</span>
                      </div>
                      <button onClick={removeVoucher} className="text-neutral-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-neutral-500 text-sm font-medium">
                    <span>Tạm tính</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(basePrice)}₫</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-primary text-sm font-bold">
                      <span>Giảm giá</span>
                      <span>-{new Intl.NumberFormat('vi-VN').format(appliedVoucher.discount)}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500 text-sm font-medium">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex justify-between items-end">
                    <span className="font-bold text-neutral-900">Thành tiền</span>
                    <span className="text-2xl font-black text-primary leading-none">
                      {new Intl.NumberFormat('vi-VN').format(totalPrice)}₫
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleAddCart}
                  disabled={isSubmitting}
                  className="w-full btn-primary rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 group"
                >
                  {isSubmitting ? 'Đang xử lý...' : (payment === 'ZaloPay' ? 'Thanh toán ZaloPay' : 'Xác nhận đặt hàng')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal for Bank Transfer */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { navigate('/mycart'); setShowModal(false); }}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="bg-primary p-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold">Đặt hàng thành công!</h3>
                <p className="text-white/80 text-sm mt-1">Vui lòng thanh toán để đơn hàng được xử lý</p>
              </div>

              <div className="p-8">
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mb-6">
                  <div className="flex items-center justify-center mb-6">
                    <img src={assets.anhqr} alt="QR Thanh toán" className="w-48 h-48 object-contain rounded-xl shadow-lg border-4 border-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard('0865863045')}>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Số tài khoản</p>
                        <p className="text-lg font-black text-neutral-900 tracking-tight">0865863045</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-neutral-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Copy size={16} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Chủ tài khoản</p>
                        <p className="text-sm font-bold text-neutral-800">NGUYEN VAN TUAN</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ngân hàng</p>
                        <p className="text-sm font-bold text-neutral-800">CAKE BANK</p>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-primary">Số tiền:</span>
                      <span className="text-lg font-black text-primary">{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { navigate('/mycart'); setShowModal(false); }}
                  className="w-full bg-neutral-900 text-white rounded-2xl py-4 font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
                >
                  Tôi đã chuyển khoản
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-4 font-medium italic">
                  Đơn hàng của bạn sẽ được xử lý sau khi tiền vào tài khoản
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutAddToCart;
