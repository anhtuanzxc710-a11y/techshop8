import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Tag, Trash2, Edit3, Plus, Search, Calendar, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vouchers = () => {
    const { aToken, backendUrl } = useContext(AdminContext);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(backendUrl + '/api/voucher/list', { headers: { aToken } });
            if (data.success) {
                setVouchers(data.vouchers);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeVoucher = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa voucher này không?")) return;
        try {
            const { data } = await axios.post(backendUrl + '/api/voucher/remove', { id }, { headers: { aToken } });
            if (data.success) {
                toast.success("Đã xóa voucher");
                fetchVouchers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (aToken) {
            fetchVouchers();
        }
    }, [aToken]);

    const filteredVouchers = vouchers.filter(v => v.code.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className='m-5 w-full'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10'>
                <div>
                    <h1 className='text-3xl font-black text-gray-900 mb-2'>Quản lý Voucher</h1>
                    <p className='text-gray-500 font-medium'>Tạo và quản lý các mã giảm giá cho cửa hàng của bạn.</p>
                </div>
                <button 
                    onClick={() => navigate('/add-voucher')}
                    className='bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-3'
                >
                    <Plus size={20} /> Tạo mã mới
                </button>
            </div>

            {/* Top Bar / Filters */}
            <div className='bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4'>
                <div className='relative flex-1 w-full'>
                    <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã voucher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold'
                    />
                </div>
                <div className='flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-bold'>
                    <Filter size={16} />
                    <span>Tất cả trạng thái</span>
                </div>
            </div>

            {loading ? (
                <div className='py-20 text-center'>
                    <div className='animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
                    <p className='text-gray-400 font-bold'>Đang tải danh sách voucher...</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                    <AnimatePresence>
                        {filteredVouchers.map((item, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={item._id}
                                className='bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group relative overflow-hidden'
                            >
                                <div className='flex gap-6'>
                                    {/* Icon / Left Side */}
                                    <div className='w-24 h-24 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100'>
                                        <Tag size={32} />
                                        <span className='text-[10px] font-black mt-1 uppercase'>{item.discountType === 'fixed' ? 'Số tiền' : 'Phần trăm'}</span>
                                    </div>

                                    {/* Content Area */}
                                    <div className='flex-1'>
                                        <div className='flex items-start justify-between mb-2'>
                                            <div>
                                                <h3 className='text-xl font-black text-gray-900 tracking-wider'>{item.code}</h3>
                                                <p className='text-sm text-gray-400 font-medium line-clamp-1'>{item.description || 'Không có mô tả'}</p>
                                            </div>
                                            <div className='text-right'>
                                                <span className='text-2xl font-black text-blue-600'>
                                                    {item.discountType === 'fixed' ? `${(item.discountValue/1000).toFixed(0)}k` : `${item.discountValue}%`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-4 mt-4 py-4 border-t border-gray-50'>
                                            <div className='space-y-1'>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Đơn tối thiểu</p>
                                                <p className='text-sm font-bold text-gray-700'>{item.minOrderValue.toLocaleString()}₫</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Ngày hết hạn</p>
                                                <p className='text-sm font-bold text-gray-700 flex items-center gap-1'>
                                                    <Calendar size={14} className='text-blue-500' />
                                                    {new Date(item.expirationDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-center justify-between mt-4'>
                                            <div className='flex items-center gap-4'>
                                                <div className='space-y-1'>
                                                    <div className='w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                                                        <div 
                                                            className='h-full bg-blue-500' 
                                                            style={{ width: `${Math.min((item.usedCount / item.usageLimit) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className='text-[10px] font-bold text-gray-400'>Đã dùng: {item.usedCount}/{item.usageLimit}</p>
                                                </div>
                                                {item.isActive ? (
                                                    <span className='px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg border border-green-100 uppercase'>Đang chạy</span>
                                                ) : (
                                                    <span className='px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 uppercase'>Dừng</span>
                                                )}
                                            </div>

                                            <div className='flex items-center gap-2'>
                                                <button 
                                                    onClick={() => navigate('/add-voucher', { state: { voucher: item } })}
                                                    className='p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all'
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => removeVoucher(item._id)}
                                                    className='p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all'
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredVouchers.length === 0 && (
                <div className='py-20 text-center bg-white rounded-[48px] border border-dashed border-gray-200'>
                    <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Tag className='w-10 h-10 text-gray-200' />
                    </div>
                    <h2 className='text-xl font-black text-gray-900 mb-2'>Không tìm thấy voucher nào</h2>
                    <p className='text-gray-400 mb-8 max-w-xs mx-auto'>Thử thay đổi từ khóa tìm kiếm hoặc tạo một mã giảm giá mới.</p>
                </div>
            )}
        </div>
    );
};

export default Vouchers;
