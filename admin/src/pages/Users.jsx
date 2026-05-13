import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Users = () => {
    const { t } = useTranslation();
    const { backendurl, aToken } = useContext(AdminContext);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/all-users`, { headers: { aToken } });
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (aToken) {
            fetchUsers();
        }
    }, [aToken]);

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/toggle-user-status`, 
                { userId, isActive: !currentStatus }, 
                { headers: { aToken } }
            );
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('users.title')}</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                    {t('users.list')}
                    {isLoading && <span className="text-sm font-normal text-blue-500 animate-pulse">{t('common.loading')}</span>}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b text-gray-600">
                                <th className="py-2 px-4">{t('users.id')}</th>
                                <th className="py-2 px-4">{t('users.name')}</th>
                                <th className="py-2 px-4">{t('users.email')}</th>
                                <th className="py-2 px-4">{t('users.phone')}</th>
                                <th className="py-2 px-4">{t('users.status')}</th>
                                <th className="py-2 px-4 text-right">{t('users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        {isLoading ? t('users.fetching') : t('users.not_found')}
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{user._id}</td>
                                        <td className="py-2 px-4 font-medium">{user.name}</td>
                                        <td className="py-2 px-4 text-gray-500">{user.email}</td>
                                        <td className="py-2 px-4 text-gray-500">{user.phone || '-'}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : (user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}`}>
                                                {user.isActive ? t('users.active') : t('users.blocked')}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <button 
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                className={`text-sm ${user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                            >
                                                {user.isActive ? t('users.block') : t('users.unblock')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;

