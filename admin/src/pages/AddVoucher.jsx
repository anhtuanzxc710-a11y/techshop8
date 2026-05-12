import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag, Calendar, DollarSign, Percent, Info, Save, ArrowLeft } from 'lucide-react';

const AddVoucher = () => {
    const { aToken, backendurl } = useContext(AdminContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we are in edit mode
    const editData = location.state?.voucher;
    const isEdit = !!editData;

    const [code, setCode] = useState(editData?.code || '');
    const [description, setDescription] = useState(editData?.description || '');
    const [discountType, setDiscountType] = useState(editData?.discountType || 'percentage');
    const [discountValue, setDiscountValue] = useState(editData?.discountValue || '');
    const [minOrderAmount, setMinOrderAmount] = useState(editData?.minOrderValue || 0);
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(editData?.maxDiscountAmount || '');
    const [expiryDate, setExpiryDate] = useState(editData?.expirationDate ? new Date(editData.expirationDate).toISOString().split('T')[0] : '');
    const [usageLimit, setUsageLimit] = useState(editData?.usageLimit || 100);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const voucherData = {
                id: editData?._id,
                code,
                description,
                discountType,
                discountValue: Number(discountValue),
                minOrderAmount: Number(minOrderAmount),
                maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
                expiryDate,
                usageLimit: Number(usageLimit)
            };

            const endpoint = isEdit ? '/api/voucher/update' : '/api/voucher/add';
            const { data } = await axios.post(backendurl + endpoint, voucherData, { headers: { aToken } });

            if (data.success) {
                toast.success(data.message);
                navigate('/vouchers');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='m-5 w-full max-w-4xl'>
            <button 
                onClick={() => navigate('/vouchers')}
                className='flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors'
            >
                <ArrowLeft size={20} />
                <span className='font-medium'>Quay lại danh sách</span>
            </button>

            <form onSubmit={onSubmitHandler} className='bg-white rounded-[32px] p-8 shadow-sm border border-gray-100'>
                <div className='flex items-center gap-4 mb-8 pb-6 border-b border-gray-50'>
                    <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600'>
                        <Tag size={24} />
                    </div>
                    <div>
                        <h2 className='text-2xl font-black text-gray-900'>{isEdit ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}</h2>
                        <p className='text-sm text-gray-400'>Thiết lập các chương trình khuyến mãi cho khách hàng</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {/* Left Column */}
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Mã Voucher</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="VD: TECHSHOP2026"
                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-black tracking-widest'
                                required
                                disabled={isEdit}
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Loại giảm giá</label>
                            <div className='grid grid-cols-2 gap-3'>
                                <button
                                    type="button"
                                    onClick={() => setDiscountType('percentage')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${discountType === 'percentage' ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    <Percent size={18} /> Phần trăm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDiscountType('fixed')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${discountType === 'fixed' ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    <DollarSign size={18} /> Số tiền cố định
                                </button>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Giá trị giảm</label>
                                <div className='relative'>
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'percentage' ? 'VD: 10 (%)' : 'VD: 50.000'}
                                        className='w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold'
                                        required
                                    />
                                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                                        {discountType === 'percentage' ? '%' : '₫'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Giới hạn sử dụng</label>
                                <input
                                    type="number"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                    className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold'
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Mô tả Voucher</label>
                            <textarea
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ghi chú về mã giảm giá này..."
                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none'
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Giá trị đơn tối thiểu (đ)</label>
                            <input
                                type="number"
                                value={minOrderAmount}
                                onChange={(e) => setMinOrderAmount(e.target.value)}
                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Giảm tối đa (đ)</label>
                            <input
                                type="number"
                                value={maxDiscountAmount}
                                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                                placeholder="Bỏ trống nếu không giới hạn"
                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold'
                            />
                            <p className='text-[10px] text-gray-400 mt-2 flex items-center gap-1'><Info size={12} /> Chỉ áp dụng cho loại giảm giá theo %</p>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1'>Ngày hết hạn</label>
                            <div className='relative'>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className='w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold'
                                    required
                                />
                                <Calendar size={18} className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            </div>
                        </div>

                        <div className='pt-8'>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className='w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50'
                            >
                                <Save size={20} />
                                {isLoading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật Voucher' : 'Kích hoạt Voucher')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddVoucher;
