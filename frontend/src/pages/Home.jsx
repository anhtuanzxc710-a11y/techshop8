import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  ChevronRight, Laptop, Smartphone, MousePointer2, Keyboard, 
  Headphones, Watch, Tv, Zap, ShieldCheck, Truck, 
  PhoneCall, ArrowRight, ShoppingBag, RotateCcw, Camera, Speaker, Refrigerator
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Banner from '../components/Banner';
import PopularProducts from '../components/PopularProducts';
import BestSeller from '../components/BestSeller';
import FamousBranch from '../components/FamousBranch';
import ProductCard from '../components/ProductCard';

const categories = [
  { name: 'Điện thoại', icon: Smartphone, cat: 'Điện thoại di động' },
  { name: 'Smartphone', icon: Smartphone, cat: 'Smartphone' },
  { name: 'Laptop', icon: Laptop, cat: 'Laptop' },
  { name: 'Tablet', icon: Laptop, cat: 'Tablet' },
  { name: 'Smartwatch', icon: Watch, cat: 'Smartwatch' },
  { name: 'Chuột Gaming', icon: MousePointer2, cat: 'Gaming mouse' },
  { name: 'Bàn phím', icon: Keyboard, cat: 'Keyboards' },
  { name: 'Màn hình', icon: Tv, cat: 'Monitors' },
  { name: 'Tai nghe', icon: Headphones, cat: 'Tai nghe' },
  { name: 'Loa', icon: Speaker, cat: 'Loa' },
  { name: 'Camera', icon: Camera, cat: 'Camera' },
  { name: 'Tivi', icon: Tv, cat: 'Tivi' },
];

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { products, setSearch } = useContext(AppContext);

  const bestSellers = products.filter(p => p.bestseller).slice(0, 10);
  const latestProducts = [...products].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 10);

  const handleCategoryClick = (cat) => {
    localStorage.setItem('category', JSON.stringify([cat]));
    setSearch('');
    navigate('/products');
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* === HERO SECTION: Sidebar + Banner === */}
      <div className="container-main pt-4">
        <div className="flex gap-4">
          {/* Sidebar Categories - Desktop */}
          <aside className="hidden lg:block w-[230px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
              <div className="bg-primary px-4 py-2.5 flex items-center gap-2">
                <ShoppingBag size={16} className="text-white" />
                <h3 className="text-white text-sm font-bold">Danh mục sản phẩm</h3>
              </div>
              <nav className="py-1">
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => handleCategoryClick(cat.cat)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 hover:text-primary group transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <cat.icon size={16} className="text-neutral-400 group-hover:text-primary transition-colors" />
                      <span className="text-[13px] text-neutral-700 group-hover:text-primary font-medium">{cat.name}</span>
                    </div>
                    <ChevronRight size={12} className="text-neutral-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Banner + Sub banners */}
          <div className="flex-1 flex flex-col gap-4">
            <Banner />
            {/* Sub banners row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative h-28 rounded-lg overflow-hidden cursor-pointer group border border-neutral-200">
                <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2e02?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-bold text-sm text-center px-2">Laptop Gaming<br/>Giảm đến 30%</span>
                </div>
              </div>
              <div className="relative h-28 rounded-lg overflow-hidden cursor-pointer group border border-neutral-200">
                <img src="https://images.unsplash.com/photo-1542487354-feaf93476caa?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-bold text-sm text-center px-2">Phụ kiện Tech<br/>Ưu đãi lớn</span>
                </div>
              </div>
              <div className="relative h-28 rounded-lg overflow-hidden cursor-pointer group border border-neutral-200">
                <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-bold text-sm text-center px-2">Màn hình 4K<br/>Mới nhất 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === TRUST BADGES BAR === */}
      <div className="container-main mt-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
          {[
            { icon: ShieldCheck, title: t('home.warranty_title'), desc: t('home.warranty_desc') },
            { icon: Zap, title: "Hỗ trợ trả góp 0%", desc: "Duyệt nhanh chóng" },
            { icon: Truck, title: t('home.shipping_title'), desc: t('home.shipping_desc') },
            { icon: Headphones, title: t('home.support_title'), desc: t('home.support_desc') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-neutral-900">{item.title}</h4>
                <p className="text-[11px] text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === FEATURED CATEGORIES GRID === */}
      <div className="container-main mt-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
          <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2 uppercase">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategoryClick(cat.cat)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="w-12 h-12 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <cat.icon size={24} className="text-neutral-400 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-600 group-hover:text-primary text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === BEST SELLER PRODUCTS === */}
      {bestSellers.length > 0 && (
        <div className="container-main mt-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 uppercase">
                <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                Sản phẩm bán chạy
              </h2>
              <button 
                onClick={() => navigate('/products')}
                className="text-primary text-[13px] font-semibold hover:underline flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === LATEST PRODUCTS === */}
      {latestProducts.length > 0 && (
        <div className="container-main mt-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 uppercase">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Sản phẩm mới nhất
              </h2>
              <button 
                onClick={() => navigate('/products')}
                className="text-primary text-[13px] font-semibold hover:underline flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === BRANDS === */}
      <div className="container-main mt-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
          <FamousBranch />
        </div>
      </div>

      {/* === FLOATING CONTACT === */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <a href="tel:0862613118" className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors animate-bounce">
          <PhoneCall size={22} />
        </a>
      </div>
    </div>
  );
};

export default Home;
