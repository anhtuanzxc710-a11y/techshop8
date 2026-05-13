import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import moment from 'moment'
import 'moment/dist/locale/vi'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const { aToken, backendurl } = useContext(AdminContext)
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const res = await axios.get(`${backendurl}/api/admin/get-all-notifications`, {
          headers: { aToken }
        })
        setNotifications(res.data.data)
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    }

    fetchAllNotifications()
  }, [aToken, backendurl])

  const deleteNotification = async () => {
    if (!confirmDelete) return

    try {
      await axios.post(`${backendurl}/api/admin/delete-notification`, {
        notificationId: confirmDelete._id
      }, {
        headers: { aToken }
      })
      setNotifications(prev => prev.filter(n => n._id !== confirmDelete._id))
      toast.success(t('orders.delete_success'))
      setConfirmDelete(null)
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const normalizeLocale = (lng) => {
    if (!lng) return 'vi';
    const base = lng.split('-')[0].toLowerCase();
    return base === 'vi' ? 'vi' : 'en';
  };

  const translateNotification = (text) => {
    if (!text) return '';
    
    // Pattern for updated cart: "The cart (id: #30) that has 1 item(s) of [Name] was updated to [Status] by admin."
    const updateRegex = /The cart \(id: #(\d+)\) that has (\d+) item\(s\) of (.*) was updated to (.*) by admin\./i;
    const updateMatch = text.match(updateRegex);
    if (updateMatch) {
      return t('orders.noti_updated', {
        id: updateMatch[1],
        items: updateMatch[2],
        name: updateMatch[3],
        status: t(`orders.${updateMatch[4].toLowerCase()}`)
      });
    }

    // Pattern for deleted cart: "The cart (id: #30) that has 1 item(s) of [Name] you ordered has been deleted by admin."
    const deleteRegex = /The cart \(id: #(\d+)\) that has (\d+) item\(s\) of (.*) you ordered has been deleted by admin\./i;
    const deleteMatch = text.match(deleteRegex);
    if (deleteMatch) {
      return t('orders.noti_deleted', {
        id: deleteMatch[1],
        items: deleteMatch[2],
        name: deleteMatch[3]
      });
    }

    return text;
  };

  return (
    <div className='p-4 sm:p-6 mx-auto w-full max-w-3xl'>
      <h2 className='text-xl sm:text-2xl font-semibold mb-4'>{t('notifications.title')}</h2>

      {
        notifications.length === 0 ? (
          <p className="text-gray-600">{t('notifications.no_notifications')}</p>
        ) : (
          notifications.map((n, index) => (
            <div key={n._id} className='p-4 mb-3 border rounded bg-white shadow-sm'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                <div className="flex-1">
                  <p className='font-medium text-gray-800 break-words'>
                    #{index + 1} | <span className='text-blue-600'>{t('notifications.user')}:</span> {n.userId} — {translateNotification(n.text)}
                  </p>
                  <p className='text-xs text-gray-500'>{moment(n.createdAt).locale(normalizeLocale(i18n.language)).fromNow()}</p>
                </div>
                <div className='flex gap-3 text-sm'>
                  <button
                    onClick={() => setSelectedNotification(n)}
                    className='text-blue-600 font-semibold underline px-2 py-1 hover:bg-blue-100 rounded'
                  >
                    {t('notifications.detail')}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(n)}
                    className='text-red-600 font-semibold underline px-2 py-1 hover:bg-red-100 rounded'
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )
      }

      {/* Detail Modal */}
      {
        selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('notifications.detail_title')}</h3>
              <div className="text-sm text-gray-800 space-y-2 break-words">
                <p><strong>ID:</strong> {selectedNotification._id}</p>
                <p><strong>{t('notifications.user')}:</strong> {selectedNotification.userId}</p>
                <p><strong>{t('notifications.text')}:</strong> {translateNotification(selectedNotification.text)}</p>
                <p><strong>{t('notifications.time')}:</strong> {moment(selectedNotification.createdAt).locale(normalizeLocale(i18n.language)).format('LLL')}</p>
                <p><strong>{t('notifications.is_read')}:</strong> {selectedNotification.isRead ? t('notifications.read') : t('notifications.unread')}</p>
              </div>
              <div className="mt-5 text-right">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {t('notifications.ok')}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirm Delete Modal */}
      {
        confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('notifications.delete_confirm')}</h3>
              <p className="text-sm text-gray-800 mb-4">
                {t('notifications.delete_desc')} #{notifications.findIndex(n => n._id === confirmDelete._id) + 1}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={deleteNotification}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Notifications