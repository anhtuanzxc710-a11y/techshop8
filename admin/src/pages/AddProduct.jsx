import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useTranslation } from 'react-i18next';

const AddProduct = () => {
  const { t } = useTranslation();
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

  const { backendurl, aToken } = useContext(AdminContext);

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
    if (aToken) {
      fetchCategories();
    }
  }, [aToken, backendurl]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (!productImg) {
        setIsLoading(false);
        return toast.error(t('product.image_not_selected'));
      }

      const formData = new FormData();
      formData.append('image', productImg);
      
      additionalImages.forEach((img) => {
        formData.append('images', img);
      });

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
        toast.success(t('product.add_success'));
        setProductImg(false);
        setAdditionalImages([]);
        setName('');
        setBrand('');
        setPrice('');
        setCategory(categories.length > 0 ? categories[0].CategoryName : '');
        setDescription('');
        setStock('');
        setSpecifications(JSON.stringify([{ key: '', value: '' }]));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
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
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='my-3 text-lg font-medium'>{t('product.add_title')}</p>
      <div className='px-8 py-8 bg-white border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex flex-wrap gap-4 mb-8 text-gray-700'>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm font-medium'>{t('product.main_image')}</p>
            <label htmlFor='product-img'>
              <img
                className='w-20 h-20 bg-gray-100 rounded-lg cursor-pointer object-cover border-2 border-dashed border-gray-300'
                src={productImg ? URL.createObjectURL(productImg) : assets.upload_product}
                alt=""
              />
            </label>
            <input onChange={(e) => setProductImg(e.target.files[0])} type='file' id='product-img' hidden />
          </div>

          <div className='flex flex-col gap-2'>
            <p className='text-sm font-medium'>{t('product.additional_images')}</p>
            <div className='flex gap-2 flex-wrap'>
              {additionalImages.map((img, index) => (
                <div key={index} className='relative'>
                   <img src={URL.createObjectURL(img)} className='w-20 h-20 object-cover rounded-lg' alt="additional" />
                   <button 
                    type="button"
                    onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== index))}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'
                   >×</button>
                </div>
              ))}
              {additionalImages.length < 5 && (
                <label className='w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors'>
                  <span className='text-2xl text-gray-400'>+</span>
                  <input 
                    type='file' 
                    multiple 
                    hidden 
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

        <div className='flex flex-col gap-4 text-gray-800'>
          <div className='flex flex-col gap-1'>
            <p>{t('product.name')}</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder={t('product.name_placeholder')} required />
          </div>

          <div className='flex flex-col gap-1'>
            <p>{t('product.brand')}</p>
            <input onChange={(e) => setBrand(e.target.value)} value={brand} className='border rounded px-3 py-2' type="text" placeholder={t('product.brand_placeholder')} required />
          </div>

          <div className='flex flex-col gap-1'>
            <p>{t('product.price')}</p>
            <input onChange={(e) => setPrice(e.target.value)} value={price} className='border rounded px-3 py-2' type="number" placeholder={t('product.price_placeholder')} required />
          </div>

          <div className='flex flex-col gap-1'>
            <p>{t('product.category')}</p>
            <select 
              onChange={(e) => setCategory(e.target.value)} 
              value={category}
              className='border rounded px-3 py-2'
            >
              <option value="">{t('product.select_category')}</option>
              {categories.map((item) => (
                <option key={item.CategoryID} value={item.CategoryName}>{item.CategoryName}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col gap-1'>
            <p>{t('product.stock')}</p>
            <input onChange={(e) => setStock(e.target.value)} value={stock} className='border rounded px-3 py-2' type="number" placeholder={t('product.stock_placeholder')} required />
          </div>

          <div>
            <p className='mt-4 mb-2'>{t('product.description')}</p>
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 pt-2 border rounded' placeholder={t('product.desc_placeholder')} rows={5} required />
          </div>

          <div className='mt-6'>
            <p className='mb-2'>{t('product.specifications')}</p>
            {JSON.parse(specifications).map((spec, index) => (
              <div key={index} className='flex items-center gap-2 mb-2'>
                <input
                  type='text'
                  placeholder={t('product.spec_key_placeholder')}
                  value={spec.key}
                  onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                  className='border rounded px-3 py-2 w-1/3'
                />
                <input
                  type='text'
                  placeholder={t('product.spec_value_placeholder')}
                  value={spec.value}
                  onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                  className='border rounded px-3 py-2 w-1/3'
                />
                <button
                  type="button"
                  onClick={() => removeSpecificationField(index)}
                  className='px-3 py-2 text-white bg-red-500 rounded'>
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecificationField}
              className='px-3 py-2 mt-2 text-white bg-green-500 rounded'>
              ➕ {t('product.add_spec')}
            </button>
          </div>
        </div>

        <button type="submit" className='bg-red-100 px-10 py-3 mt-4 text-black rounded-full'>{t('product.add_title')}</button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className='fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-40 flex items-center justify-center'>
          <div className='px-6 py-4 text-white bg-gray-800 rounded-lg text-lg font-medium shadow-lg'>
            {t('common.processing')}
          </div>
        </div>
      )}
    </form>
  );
};

export default AddProduct;

