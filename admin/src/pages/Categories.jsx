import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Categories = () => {
    const { t } = useTranslation();
    const { backendurl, aToken } = useContext(AdminContext);
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/categories`, { headers: { aToken } });
            if (data.success) {
                setCategories(data.categories);
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
            fetchCategories();
        }
    }, [aToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const payload = { name, parentId: parentId || null };
            let res;
            if (editMode) {
                payload.id = editId;
                res = await axios.post(`${backendurl}/api/admin/update-category`, payload, { headers: { aToken } });
            } else {
                res = await axios.post(`${backendurl}/api/admin/add-category`, payload, { headers: { aToken } });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                resetForm();
                await fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('categories.delete_confirm'))) return;
        setIsProcessing(true);
        try {
            const res = await axios.post(`${backendurl}/api/admin/delete-category/${id}`, {}, { headers: { aToken } });
            if (res.data.success) {
                toast.success(res.data.message);
                await fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = (cat) => {
        setEditMode(true);
        setEditId(cat.CategoryID);
        setName(cat.CategoryName);
        setParentId(cat.ParentCategoryID || '');
    };

    const resetForm = () => {
        setEditMode(false);
        setEditId(null);
        setName('');
        setParentId('');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('categories.title')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-lg font-bold mb-4">{editMode ? t('categories.edit') : t('categories.add_new')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.name')}</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.parent')}</label>
                            <select 
                                value={parentId} 
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                disabled={isProcessing}
                            >
                                <option value="">{t('categories.none')}</option>
                                {categories.filter(c => c.CategoryID !== editId).map(cat => (
                                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="bg-blue-600 text-white px-4 py-2 rounded flex-1 hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {isProcessing ? t('common.processing') : (editMode ? t('categories.update') : t('products.add'))}
                            </button>
                            {editMode && (
                                <button 
                                    type="button" 
                                    onClick={resetForm} 
                                    disabled={isProcessing}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                                >
                                    {t('common.cancel')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                        {t('categories.list')}
                        {isLoading && <span className="text-sm font-normal text-blue-500 animate-pulse">{t('categories.refreshing')}</span>}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-gray-600">
                                    <th className="py-2 px-4">{t('categories.id')}</th>
                                    <th className="py-2 px-4">{t('categories.name')}</th>
                                    <th className="py-2 px-4">{t('categories.parent')}</th>
                                    <th className="py-2 px-4 text-right">{t('categories.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">
                                            {isLoading ? t('categories.loading') : t('categories.not_found')}
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat.CategoryID} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-4">{cat.CategoryID}</td>
                                            <td className="py-2 px-4 font-medium">{cat.CategoryName}</td>
                                            <td className="py-2 px-4 text-gray-500">{cat.ParentCategoryName || '-'}</td>
                                            <td className="py-2 px-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(cat)} 
                                                    disabled={isProcessing}
                                                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                >
                                                    {t('common.edit')}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.CategoryID)} 
                                                    disabled={isProcessing}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    {t('common.delete')}
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
        </div>
    );
};

export default Categories;

