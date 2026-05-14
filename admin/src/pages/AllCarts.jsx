import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Search, Trash2, Box, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const AllCarts = () => {
  const { t } = useTranslation();
  const {
    aToken,
    carts,
    getCarts,
    removeCart,
    changeCartStatus,
    notifyChangeStatusCart
  } = useContext(AdminContext);

  const [changeCart, setChangeCart] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  
  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCarts = async () => {
      if (aToken) {
        try {
          await getCarts();
        } catch (error) {
          console.error('Error fetching carts:', error);
        }
      }
    };
    fetchCarts();
  }, [aToken, changeCart]);

  const confirmDelete = async () => {
    if (selectedCart) {
      try {
        await removeCart(selectedCart._id);
        await notifyChangeStatusCart({
          userId: selectedCart.userId,
          text: t('orders.noti_deleted', {
            id: selectedCart._id,
            items: selectedCart.totalItems,
            name: selectedCart.itemData.name
          })
        });
        setChangeCart(prev => !prev);
        setSelectedCart(null);
        toast.success(t('orders.delete_success'));
      } catch (error) {
        console.error('Error deleting cart:', error);
      }
    }
  };

  const handleStatusChange = async (cart, newStatus) => {
    const success = await changeCartStatus(cart._id, newStatus);
    if (success) {
      const statusText = t(`orders.${newStatus}`);
      await notifyChangeStatusCart({
        userId: cart.userId,
        text: t('orders.noti_updated', {
          id: cart._id,
          items: cart.totalItems,
          name: cart.itemData.name,
          status: statusText
        })
      });
      setChangeCart(prev => !prev);
      toast.success("Order status updated");
    }
  };

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = cart.itemData?.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(cart._id).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate
  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage) || 1;
  const paginatedCarts = filteredCarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'processing': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('orders.title')}</h1>
        <p className="text-gray-500 mt-1">Quản lý và cập nhật trạng thái đơn hàng</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sản phẩm hoặc mã đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
            <select 
              value={statusFilter}
              onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 bg-gray-50"
            >
              <option value="all">Tất cả</option>
              <option value="processing">{t('orders.processing')}</option>
              <option value="shipped">{t('orders.shipped')}</option>
              <option value="delivered">{t('orders.delivered')}</option>
              <option value="cancelled">{t('orders.cancelled')}</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCarts.length > 0 ? paginatedCarts.map((cart) => (
                <tr key={cart._id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={cart.itemData?.image_url} alt="Product" className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" />
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1 max-w-[250px]">{cart.itemData?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{cart.itemData?.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{String(cart._id).slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Box className="w-4 h-4 text-gray-400" /> {cart.totalItems}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                      <CreditCard className="w-4 h-4 text-emerald-500" /> 
                      {new Intl.NumberFormat('vi-VN').format(cart.totalPrice)}₫
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={cart.status}
                      onChange={(e) => handleStatusChange(cart, e.target.value)}
                      className={`text-xs font-bold border rounded-lg px-3 py-1.5 cursor-pointer outline-none transition-all ${getStatusStyle(cart.status)}`}
                    >
                      <option value="processing">{t('orders.processing')}</option>
                      <option value="shipped">{t('orders.shipped')}</option>
                      <option value="delivered">{t('orders.delivered')}</option>
                      <option value="cancelled">{t('orders.cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCart(cart)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Xóa đơn hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Box className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">Không tìm thấy đơn hàng nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredCarts.length)}</span> trên <span className="font-bold text-gray-800">{filteredCarts.length}</span> đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-gray-800 bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-lg">
              {currentPage}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-slideDown">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {t('orders.delete_confirm')}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng <span className="font-bold text-gray-800">{selectedCart.itemData?.name}</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedCart(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors active:scale-95"
              >
                Xóa đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCarts;
