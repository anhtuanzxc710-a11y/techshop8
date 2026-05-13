import React from 'react';
import Banner from '../components/Banner';
import TypeOfDevice from '../components/TypeOfDevice';
import FamousBranch from '../components/FamousBranch';
import PopularProducts from '../components/PopularProducts';
import BestSeller from '../components/BestSeller';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const trustBadges = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: t('home.shipping_title'),
      description: t('home.shipping_desc')
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: t('home.warranty_title'),
      description: t('home.warranty_desc')
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-primary" />,
      title: t('home.return_title'),
      description: t('home.return_desc')
    },
    {
      icon: <Headphones className="w-8 h-8 text-primary" />,
      title: t('home.support_title'),
      description: t('home.support_desc')
    }
  ];

  return (
    <div className="container-main pb-16">
      {/* Hero Section */}
      <Banner />

      {/* Trust Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-b border-neutral-100">
        {trustBadges.map((badge, index) => (
          <div key={index} className="flex items-center gap-4 px-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
              {badge.icon}
            </div>
            <div>
              <h4 className="font-bold text-neutral-800 text-sm sm:text-base">{badge.title}</h4>
              <p className="text-xs text-neutral-500">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <TypeOfDevice />

      {/* Promotion/Flash Sale Mockup */}
      <div className="my-8 rounded-3xl overflow-hidden relative h-48 sm:h-64 bg-neutral-900 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center px-8 sm:px-16 z-20">
          <div className="max-w-md">
            <span className="badge bg-error text-white mb-4">Limited Offer</span>
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">{t('home.sale_title')}</h3>
            <p className="text-neutral-300 text-sm mb-6">{t('home.sale_desc')}</p>
            <button className="btn-primary rounded-full">{t('home.view_now')}</button>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop"
          alt="Sale"
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Apple Section */}
      <PopularProducts />

      {/* Brands */}
      <FamousBranch />

      {/* Bestsellers/Laptops */}
      <BestSeller />
    </div>
  );
};

export default Home;
