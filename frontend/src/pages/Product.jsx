import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { Filter, X, SlidersHorizontal, Trash2, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
        <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" /> {t('common.filter')}
        </h3>
        <button 
          onClick={handleClearFilter} 
          className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> {t('common.clear_filter')}
        </button>
      </div>

      {/* Category */}
      <section>
        <h4 className="font-black text-neutral-900 mb-6 text-[10px] uppercase tracking-[0.2em]">{t('filter.category')}</h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {categoriesList.map((cat) => (
            <label key={cat} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${category.includes(cat) ? 'bg-primary border-primary' : 'bg-white border-neutral-200 group-hover:border-primary/50'}`}>
                   {category.includes(cat) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm font-bold transition-colors ${category.includes(cat) ? 'text-primary' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                  {cat}
                </span>
              </div>
              <input type="checkbox" checked={category.includes(cat)} onChange={() => toggleCategory(cat)} className="hidden" />
            </label>
          ))}
        </div>
      </section>

      {/* Brand */}
      <section>
        <h4 className="font-black text-neutral-900 mb-6 text-[10px] uppercase tracking-[0.2em]">{t('filter.brand')}</h4>
        <div className="grid grid-cols-2 gap-3">
          {brandsList.map((br) => (
            <button
              key={br}
              onClick={() => toggleBrand(br)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all active:scale-95 ${brand.includes(br)
                  ? 'bg-primary border-primary text-white shadow-glow'
                  : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'
                }`}
            >
              {br}
            </button>
          ))}
        </div>
      </section>

      {/* Price Ranges */}
      <section>
        <h4 className="font-black text-neutral-900 mb-6 text-[10px] uppercase tracking-[0.2em]">{t('filter.price_range')}</h4>
        <div className="space-y-3">
          {priceRangesList.map((range) => (
            <label key={range.label} className="flex items-center gap-4 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${priceRange?.min === range.min && priceRange?.max === range.max ? 'bg-primary border-primary' : 'bg-white border-neutral-200 group-hover:border-primary/50'}`}>
                 {priceRange?.min === range.min && priceRange?.max === range.max && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${priceRange?.min === range.min && priceRange?.max === range.max ? 'text-primary' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                {range.label}
              </span>
              <input type="radio" name="priceRange" checked={priceRange?.min === range.min && priceRange?.max === range.max} onChange={() => setPriceRange(range)} className="hidden" />
            </label>
          ))}
        </div>
      </section>

      {/* Best Seller */}
      <section>
        <button 
          onClick={() => setShowBsl(!showBsl)}
          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${showBsl ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-neutral-50 border-transparent hover:border-neutral-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${showBsl ? 'bg-amber-500 animate-pulse' : 'bg-neutral-300'}`} />
            <span className={`text-xs font-black uppercase tracking-widest ${showBsl ? 'text-amber-700' : 'text-neutral-500'}`}>{t('common.bestseller')}</span>
          </div>
          <ChevronRight size={16} className={`${showBsl ? 'text-amber-500' : 'text-neutral-300'}`} />
        </button>
      </section>
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
    <div className="container-main py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32 glass-morphism rounded-[40px] p-8">
            <FilterSidebar 
              category={category} toggleCategory={toggleCategory}
              brand={brand} toggleBrand={toggleBrand}
              priceRange={priceRange} setPriceRange={setPriceRange}
              showBsl={showBsl} setShowBsl={setShowBsl}
              handleClearFilter={handleClearFilter}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-1.5 h-6 bg-primary rounded-full" />
                 <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">
                   {search ? `${t('common.search')}: "${search}"` : t('common.all_products')}
                 </h1>
              </div>
              <p className="text-neutral-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">
                Tìm thấy {filterPro.filter(i => !showBsl || i.bestseller).length} thiết bị phù hợp
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-neutral-100 rounded-2xl text-sm font-black shadow-sm active:scale-95 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5 text-primary" /> {t('common.filter')}
              </button>

              <div className="relative flex-1 md:w-64">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-white border-2 border-neutral-100 rounded-2xl px-6 py-4 text-sm font-black focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">{t('common.sort_default')}</option>
                  <option value="newest">{t('common.sort_newest')}</option>
                  <option value="oldest">{t('common.sort_oldest')}</option>
                  <option value="price-asc">{t('common.sort_price_asc')}</option>
                  <option value="price-desc">{t('common.sort_price_desc')}</option>
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Chips */}
          <AnimatePresence>
            {(category.length > 0 || brand.length > 0 || priceRange || showBsl) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                {category.map(cat => (
                  <span key={cat} className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {cat} <X className="w-3.5 h-3.5 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => toggleCategory(cat)} />
                  </span>
                ))}
                {brand.map(br => (
                  <span key={br} className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {br} <X className="w-3.5 h-3.5 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => toggleBrand(br)} />
                  </span>
                ))}
                {priceRange && (
                  <span className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {priceRange.label} <X className="w-3.5 h-3.5 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => setPriceRange(null)} />
                  </span>
                )}
                {showBsl && (
                  <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm">
                    {t('common.bestseller')} <X className="w-3.5 h-3.5 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => setShowBsl(false)} />
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : filterPro.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filterPro.map((item, idx) => (
                (!showBsl || item.bestseller) && (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 6) * 0.1 }}
                  >
                    <ProductCard product={item} />
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[64px] border-2 border-dashed border-neutral-100 shadow-sm">
              <div className="w-24 h-24 bg-neutral-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                <Search className="w-12 h-12 text-neutral-200" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight">Không tìm thấy siêu phẩm nào</h3>
              <p className="text-neutral-400 max-w-xs mx-auto font-medium">Hãy thử thay đổi tiêu chí lọc hoặc từ khóa tìm kiếm khác nhé.</p>
              <button onClick={handleClearFilter} className="btn-primary mt-10 px-12 py-5 rounded-[24px] font-black shadow-glow active:scale-95 transition-all">
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowMobileFilter(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-white shadow-2xl p-8 flex flex-col rounded-l-[48px]"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black tracking-tight">{t('common.filter')}</h3>
                <button onClick={() => setShowMobileFilter(false)} className="p-3 rounded-2xl bg-neutral-50 text-neutral-400 hover:text-primary transition-all">
                  <X className="w-7 h-7" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                <FilterSidebar 
                  category={category} toggleCategory={toggleCategory}
                  brand={brand} toggleBrand={toggleBrand}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  showBsl={showBsl} setShowBsl={setShowBsl}
                  handleClearFilter={handleClearFilter}
                />
              </div>
              <div className="pt-8 border-t border-neutral-100">
                <button onClick={() => setShowMobileFilter(false)} className="btn-primary w-full rounded-[24px] py-6 font-black text-lg shadow-glow active:scale-95 transition-all">
                  Xem {filterPro.length} kết quả
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Product;

