import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { Filter, X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const categoriesList = [
  'Điện thoại di động', 'Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 
  'Gaming mouse', 'Keyboards', 'Monitors', 'Tai nghe', 'Loa', 
  'Máy giặt', 'Máy hút bụi', 'Tủ lạnh', 'Tivi', 'Camera', 'Webcam'
];
const brandsList = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Asus', 'Acer', 'MSI', 'Logitech', 'Sony', 'LG', 'JBL', 'Huawei', 'Hera'];

const FilterSidebar = ({ category, toggleCategory, brand, toggleBrand, priceRange, setPriceRange, showBsl, setShowBsl, handleClearFilter }) => {
  const { t } = useTranslation();
  
  const priceRangesList = [
    { label: t('filter.price_under_1m'), min: 0, max: 1000000 },
    { label: t('filter.price_1_5m'), min: 1000000, max: 5000000 },
    { label: t('filter.price_5_15m'), min: 5000000, max: 15000000 },
    { label: t('filter.price_15_30m'), min: 15000000, max: 30000000 },
    { label: t('filter.price_30_50m'), min: 30000000, max: 50000000 },
    { label: t('filter.price_over_50m'), min: 50000000, max: 999999999 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Filter className="w-5 h-5" /> {t('common.filter')}
        </h3>
        <button onClick={handleClearFilter} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> {t('common.clear_filter')}
        </button>
      </div>

      {/* Category */}
      <div>
        <h4 className="font-semibold text-neutral-800 mb-4 text-xs uppercase tracking-widest">{t('filter.category')}</h4>
        <div className="space-y-2">
          {categoriesList.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={category.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <span className={`text-sm transition-colors ${category.includes(cat) ? 'text-primary font-semibold' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-semibold text-neutral-800 mb-4 text-xs uppercase tracking-widest">{t('filter.brand')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {brandsList.map((br) => (
            <button
              key={br}
              onClick={() => toggleBrand(br)}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${brand.includes(br)
                  ? 'bg-primary-50 border-primary text-primary font-bold'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
            >
              {br}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div>
        <h4 className="font-semibold text-neutral-800 mb-4 text-xs uppercase tracking-widest">{t('filter.price_range')}</h4>
        <div className="space-y-2">
          {priceRangesList.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange?.min === range.min && priceRange?.max === range.max}
                onChange={() => setPriceRange(range)}
                className="w-4 h-4 border-neutral-300 text-primary focus:ring-primary"
              />
              <span className={`text-sm transition-colors ${priceRange?.min === range.min && priceRange?.max === range.max ? 'text-primary font-semibold' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Best Seller */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group p-3 bg-amber-50 rounded-xl border border-amber-100">
          <input
            type="checkbox"
            checked={showBsl}
            onChange={() => setShowBsl(!showBsl)}
            className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm font-bold text-amber-700">{t('common.bestseller')}</span>
        </label>
      </div>
    </div>
  );
};

const Product = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { backendurl, search } = useContext(AppContext);

  const getLocalArray = (key) => {
    const val = localStorage.getItem(key);
    try { return val ? JSON.parse(val) : []; } catch { return []; }
  };

  const [filterPro, setFilterPro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBsl, setShowBsl] = useState(false);
  const [category, setCategory] = useState(getLocalArray('category'));
  const [brand, setBrand] = useState(getLocalArray('brand'));
  const [priceRange, setPriceRange] = useState(null);
  const [sortOrder, setSortOrder] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const handleClearFilter = () => {
    localStorage.removeItem('category');
    setCategory([]);
    localStorage.removeItem('brand');
    setBrand([]);
    setPriceRange(null);
    setShowBsl(false);
    setSortOrder('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (cat) => {
    setCategory(prev => prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]);
  };

  const toggleBrand = (br) => {
    setBrand(prev => prev.includes(br) ? prev.filter(i => i !== br) : [...prev, br]);
  };

  useEffect(() => {
    localStorage.setItem('category', JSON.stringify(category));
    localStorage.setItem('brand', JSON.stringify(brand));
  }, [category, brand]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendurl}/api/product/get-products`, {
          params: { 
            query: search, 
            category, 
            brand, 
            minPrice: priceRange ? priceRange.min : null, 
            maxPrice: priceRange ? priceRange.max : null 
          }
        });
        let fproducts = res.data.products;

        if (sortOrder === "newest") {
          fproducts = [...fproducts].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        } else if (sortOrder === "oldest") {
          fproducts = [...fproducts].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        } else if (sortOrder === "price-asc") {
          fproducts = [...fproducts].sort((a, b) => a.price - b.price);
        } else if (sortOrder === "price-desc") {
          fproducts = [...fproducts].sort((a, b) => b.price - a.price);
        }

        setFilterPro(fproducts);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, category, brand, priceRange, backendurl, sortOrder]);

  return (
    <div className="container-main py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar 
            category={category} toggleCategory={toggleCategory}
            brand={brand} toggleBrand={toggleBrand}
            priceRange={priceRange} setPriceRange={setPriceRange}
            showBsl={showBsl} setShowBsl={setShowBsl}
            handleClearFilter={handleClearFilter}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-neutral-900">
                {search ? `${t('common.search')}: "${search}"` : t('common.all_products')}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {t('common.results', { count: filterPro.filter(i => !showBsl || i.bestseller).length })}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> {t('common.filter')}
              </button>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="flex-1 sm:flex-none bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary"
              >
                <option value="">{t('common.sort_default')}</option>
                <option value="newest">{t('common.sort_newest')}</option>
                <option value="oldest">{t('common.sort_oldest')}</option>
                <option value="price-asc">{t('common.sort_price_asc')}</option>
                <option value="price-desc">{t('common.sort_price_desc')}</option>
              </select>
            </div>
          </div>

          {/* Active Chips */}
          {(category.length > 0 || brand.length > 0 || priceRange || showBsl) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category.map(cat => (
                <span key={cat} className="badge-primary px-3 py-1 flex items-center gap-2 text-[10px]">
                  {cat} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                </span>
              ))}
              {brand.map(br => (
                <span key={br} className="badge-primary px-3 py-1 flex items-center gap-2 text-[10px]">
                  {br} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(br)} />
                </span>
              ))}
              {priceRange && (
                <span className="badge-primary px-3 py-1 flex items-center gap-2 text-[10px]">
                  {t('filter.price_range')}: {priceRange.label} <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange(null)} />
                </span>
              )}
              {showBsl && (
                <span className="badge bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 flex items-center gap-2 text-[10px]">
                  {t('common.bestseller')} <X className="w-3 h-3 cursor-pointer" onClick={() => setShowBsl(false)} />
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : filterPro.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterPro.map(item => (
                (!showBsl || item.bestseller) && (
                  <ProductCard key={item._id} product={item} />
                )
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800">{t('common.no_products')}</h3>
              <p className="text-neutral-500 mt-2">{t('common.filter_empty_desc')}</p>
              <button onClick={handleClearFilter} className="btn-primary mt-6 px-8 rounded-full">{t('common.clear_filter')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl p-6 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">{t('common.filter')}</h3>
              <button onClick={() => setShowMobileFilter(false)} className="p-2 rounded-xl hover:bg-neutral-100">
                <X className="w-6 h-6 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar 
                category={category} toggleCategory={toggleCategory}
                brand={brand} toggleBrand={toggleBrand}
                priceRange={priceRange} setPriceRange={setPriceRange}
                showBsl={showBsl} setShowBsl={setShowBsl}
                handleClearFilter={handleClearFilter}
              />
            </div>
            <button onClick={() => setShowMobileFilter(false)} className="btn-primary w-full mt-6 rounded-xl py-4 font-bold">
              {t('common.view_now')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
