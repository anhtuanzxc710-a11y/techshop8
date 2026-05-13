import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AllCarts = () => {
  const { t, i18n } = useTranslation();
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

  const handleDeleteClick = (cart) => {
    setSelectedCart(cart);
  };

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
    }
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>{t('orders.title')}</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>

        {/* Header (Desktop only) */}
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1fr_1fr_2fr] py-3 px-6 border-b font-semibold text-gray-700'>
          <p>#</p>
          <p>{t('orders.product')}</p>
          <p>{t('orders.items')}</p>
          <p>{t('orders.price')}</p>
          <p>{t('orders.status')}</p>
          <p>{t('orders.actions')}</p>
        </div>

        {/* Cart rows */}
        {
          carts.map((cart, index) =>
            <div
              key={cart._id}
              className='border-b py-3 px-6 hover:bg-gray-50 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1fr_1fr_2fr] flex flex-col gap-2 sm:gap-0'
            >
              {/* Index (only desktop) */}
              <p className='hidden sm:block'>{index + 1}</p>

              {/* Product */}
              <div className='flex items-center gap-2'>
                <img
                  className='w-8 h-8 rounded-full object-cover'
                  src={cart.itemData.image_url}
                  alt="Product"
                />
                <p className='font-medium'>{cart.itemData.name}</p>
              </div>

              {/* Items */}
              <p>
                <span className='sm:hidden font-semibold'>{t('orders.items')}: </span>
                {cart.totalItems}
              </p>

              {/* Price */}
              <p>
                <span className='sm:hidden font-semibold'>{t('orders.price')}: </span>
                {cart.totalPrice} VNĐ
              </p>

              {/* Status */}
              <div>
                <span className='sm:hidden font-semibold'>{t('orders.status')}: </span>
                <select
                  value={cart.status}
                  onChange={(e) => handleStatusChange(cart, e.target.value)}
                  className='text-xs border rounded px-2 py-1 bg-white'
                >
                  <option value="processing">{t('orders.processing')}</option>
                  <option value="shipped">{t('orders.shipped')}</option>
                  <option value="delivered">{t('orders.delivered')}</option>
                  <option value="cancelled">{t('orders.cancelled')}</option>
                </select>
              </div>

              {/* Actions */}
              <div>
                <button
                  onClick={() => handleDeleteClick(cart)}
                  className='text-red-500 hover:text-red-700 text-xs underline'
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          )
        }
      </div>

      {/* Delete Confirmation Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-11/12 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('orders.delete_confirm')} {selectedCart.itemData.name}?
            </h3>
            <p className="text-gray-700">
              {t('orders.delete_desc')} <b>{selectedCart.totalItems}</b> {t('orders.items').toLowerCase()}?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedCart(null)}
                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {t('orders.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCarts;