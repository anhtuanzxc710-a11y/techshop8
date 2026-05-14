import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Filter, Edit, Trash2, Box, Tag, ChevronLeft, ChevronRight } from 'lucide-react';


const ProductsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    aToken,
    backendurl,
    changeAvailability,
    getProducts,
    products,
    setProducts,
    changeBestsellerStatus,
    filterProducts,
    setFilterProducts,
    search,
    deleteProduct
  } = useContext(AdminContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // View & Filter State
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [productImg, setProductImg] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [specifications, setSpecifications] = useState(JSON.stringify([{ key: '', value: '' }]));
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (item) => {
    navigate('/update-product', {
      state: {
        productId: item._id,
        specifications: item.specifications,
        name: item.name,
        category: item.category,
        brand: item.brand,
        description: item.description,
        image_url: item.image_url,
        price: item.price,
        stock_quantity: item.stock_quantity,
      },
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (aToken) {
          await getProducts();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [aToken]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${backendurl}/api/admin/categories`, { headers: { aToken } });
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategory(data.categories[0].CategoryName);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (aToken && backendurl) {
      fetchCategories();
    }
  }, [aToken, backendurl]);

  useEffect(() => {
    let filtered = products;
    if (search) {
      filtered = filtered.filter((product) =>
        product?.name.toLowerCase().includes(search.toLowerCase()) ||
        product?.category.toLowerCase().includes(search.toLowerCase()) ||
        product?.brand.toLowerCase().includes(search.toLowerCase()) ||
        product?.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategoryFilter);
    }
    setFilterProducts(filtered);
    setCurrentPage(1);
  }, [search, products, selectedCategoryFilter, setFilterProducts]);

  const totalPages = Math.ceil(filterProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filterProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct._id);
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const onAddProductHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (!productImg) {
        setIsLoading(false);
        return toast.error('Image not selected');
      }

      const formData = new FormData();
      formData.append('image', productImg);
      additionalImages.forEach((img) => formData.append('images', img));
      formData.append('name', name);
      formData.append('brand', brand);
      formData.append('price', Number(price));
      formData.append('category', category);
      formData.append('description', description);
      formData.append('stock_quantity', Number(stock));

      const specificationsObj = {};
      JSON.parse(specifications).forEach((item) => {
        if (item.key.trim() && item.value.trim()) {
          specificationsObj[item.key] = item.value;
        }
      });
      formData.append('specifications', JSON.stringify(specificationsObj));

      const { data } = await axios.post(
        backendurl + '/api/admin/add-product',
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success('Product added successfully');
        setShowAddModal(false);
        // Reset form
        setProductImg(false);
        setAdditionalImages([]);
        setName('');
        setBrand('');
        setPrice('');
        setDescription('');
        setStock('');
        setSpecifications(JSON.stringify([{ key: '', value: '' }]));
        // Refresh list
        await getProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecificationChange = (index, field, value) => {
    const updated = JSON.parse(specifications);
    updated[index][field] = value;
    setSpecifications(JSON.stringify(updated));
  };

  const addSpecificationField = () => {
    const updated = JSON.parse(specifications);
    updated.push({ key: '', value: '' });
    setSpecifications(JSON.stringify(updated));
  };

  const removeSpecificationField = (index) => {
    const updated = JSON.parse(specifications);
    if (updated.length > 1) {
      updated.splice(index, 1);
      setSpecifications(JSON.stringify(updated));
    }
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-gray-800">{t('products.title')}</h1>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all ${showAddModal
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
        >
          {showAddModal ? t('products.close') : t('products.add')}
        </button>
      </div>

      {/* Add Product Collapsible Section */}
      {showAddModal && (
        <div className="mb-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
          <div className="p-6 bg-gray-50 border-b">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-primary w-2 h-6 rounded-full"></span>
              {t('products.add_new')}
            </h2>
          </div>

          <form onSubmit={onAddProductHandler} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Images */}
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-4">{t('products.upload_main')}</p>
                  <label htmlFor="product-img-inline" className="cursor-pointer block group">
                    <div className="relative w-full h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden group-hover:border-primary group-hover:bg-indigo-50/30 transition-all">
                      {productImg ? (
                        <img src={URL.createObjectURL(productImg)} className="w-full h-full object-contain p-4" alt="preview" />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <img src={assets.upload_product} className="w-8 opacity-60" alt="" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">{t('products.upload_click')}</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <input onChange={(e) => setProductImg(e.target.files[0])} type="file" id="product-img-inline" hidden />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-4">{t('products.upload_gallery')}</p>
                  <div className="flex gap-4 flex-wrap">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative w-24 h-24 group">
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm" alt="" />
                        <button
                          type="button"
                          onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                        >×</button>
                      </div>
                    ))}
                    {additionalImages.length < 5 && (
                      <label className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-indigo-50/30 transition-all group">
                        <span className="text-3xl text-gray-300 group-hover:text-primary transition-colors">+</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('products.add')}</span>
                        <input
                          type="file" multiple hidden
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setAdditionalImages(prev => [...prev, ...files].slice(0, 5));
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Information */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('products.name')}</label>
                  <input onChange={(e) => setName(e.target.value)} value={name} className="w-full border border-gray-200 rounded-xl px-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30" type="text" placeholder="e.g. MacBook Pro M3 Max" required />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('products.brand')}</label>
                    <input onChange={(e) => setBrand(e.target.value)} value={brand} className="w-full border border-gray-200 rounded-xl px-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30" type="text" placeholder="e.g. Apple" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('products.category')}</label>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} className="w-full border border-gray-200 rounded-xl px-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30">
                      {categories.map((item) => (
                        <option key={item.CategoryID} value={item.CategoryName}>{item.CategoryName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('products.price')} (VND)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
                      <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full border border-gray-200 rounded-xl pl-10 pr-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30" type="number" placeholder="0" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('products.stock')}</label>
                    <input onChange={(e) => setStock(e.target.value)} value={stock} className="w-full border border-gray-200 rounded-xl px-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30" type="number" placeholder="0" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('products.desc')}</label>
                  <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/30 min-h-[140px]" placeholder="Share more details about the product..." required />
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-green-500 w-2 h-6 rounded-full"></span>
                  {t('products.specs')}
                </h3>
                <button
                  type="button" onClick={addSpecificationField}
                  className="text-primary text-sm font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>+</span> {t('products.add_row')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {JSON.parse(specifications).map((spec, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 animate-fadeIn">
                    <input
                      type="text" placeholder="Key (e.g. CPU)" value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text" placeholder="Value (e.g. M3)" value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button" onClick={() => removeSpecificationField(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                    >&times;</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4">
              <button
                type="button" onClick={() => setShowAddModal(false)}
                className="px-8 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit" disabled={isLoading}
                className="px-12 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-3"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {t('common.processing')}</>
                ) : (
                  t('products.add')
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar: Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 mt-6">
        <div className="flex items-center gap-3 w-full sm:w-auto mb-4 sm:mb-0">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="border-none bg-gray-50 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={`filter-${item.CategoryID}`} value={item.CategoryName}>{item.CategoryName}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4">Tồn kho</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length > 0 ? paginatedProducts.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" />
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        <Tag className="w-3 h-3" /> {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {Number(item.price).toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${item.stock_quantity <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-700 w-12 text-right">Hiển thị</span>
                          <div className="relative">
                            <input
                              type="checkbox" className="sr-only peer" checked={item.available}
                              onChange={() => {
                                changeAvailability(item._id);
                                setProducts(prev => prev.map(p => p._id === item._id ? { ...p, available: !p.available } : p));
                              }}
                            />
                            <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
                          </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-700 w-12 text-right">Best</span>
                          <div className="relative">
                            <input
                              type="checkbox" className="sr-only peer" checked={item.bestseller}
                              onChange={() => {
                                changeBestsellerStatus(item._id);
                                setProducts(prev => prev.map(p => p._id === item._id ? { ...p, bestseller: !p.bestseller } : p));
                              }}
                            />
                            <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-amber-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
                          </div>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleNavigate(item)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedProduct(item); setShowDeleteModal(true); }} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Box className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="font-medium">Không tìm thấy sản phẩm nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-wrap gap-4 gap-y-6 mb-6">
          {paginatedProducts.map((item, index) => (
            <div className="bg-white border border-gray-100 rounded-2xl max-w-[210px] overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" key={index}>
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                  onClick={() => handleNavigate(item)}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                  src={item.image_url}
                  alt=""
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleNavigate(item)}
                    className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowDeleteModal(true);
                    }}
                    className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-gray-800 font-bold text-sm line-clamp-1 mb-1">{item.name}</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{item.category}</span>
                  <span className="text-primary font-bold text-xs">{Number(item.price).toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-semibold text-neutral-500">Kho: <strong className={item.stock_quantity <= 5 ? 'text-red-500' : 'text-neutral-700'}>{item.stock_quantity}</strong></span>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <label className="flex items-center justify-between cursor-pointer group/toggle">
                    <span className="text-[11px] font-medium text-gray-500 group-hover/toggle:text-gray-700 transition-colors">{t('products.available')}</span>
                    <div className="relative">
                      <input
                        onChange={() => {
                          changeAvailability(item._id);
                          setProducts((prevProducts) =>
                            prevProducts.map((p) =>
                              p._id === item._id ? { ...p, available: !p.available } : p
                            )
                          );
                        }}
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.available}
                      />
                      <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group/toggle">
                    <span className="text-[11px] font-medium text-gray-500 group-hover/toggle:text-gray-700 transition-colors">{t('products.bestseller')}</span>
                    <div className="relative">
                      <input
                        onChange={() => {
                          changeBestsellerStatus(item._id);
                          setProducts((prevProducts) =>
                            prevProducts.map((p) =>
                              p._id === item._id ? { ...p, bestseller: !p.bestseller } : p
                            )
                          );
                        }}
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.bestseller}
                      />
                      <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-400"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pb-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-800 bg-white border border-gray-200 px-4 h-10 flex items-center justify-center rounded-xl shadow-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-popIn border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner animate-bounce">!</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products.delete_confirm')}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {t('products.delete_desc')} <br /><span className="text-red-500 font-bold">"{selectedProduct.name}"</span>? {t('products.no_undo')}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
              >{t('common.cancel')}</button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-red-500 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
              >{t('common.yes_delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;

