import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

const Banner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);
  const images = [
    {
      url: assets.banner2,
      title: t('home.banners.b2.title'),
      subtitle: t('home.banners.b2.subtitle'),
      description: t('home.banners.b2.description'),
      cta: t('home.banners.b2.cta'),
      link: "/products"
    },
    {
      url: assets.banner1,
      title: t('home.banners.b1.title'),
      subtitle: t('home.banners.b1.subtitle'),
      description: t('home.banners.b1.description'),
      cta: t('home.banners.b1.cta'),
      link: "/products/Accessory"
    },
    {
      url: assets.banner3,
      title: t('home.banners.b3.title'),
      subtitle: t('home.banners.b3.subtitle'),
      description: t('home.banners.b3.description'),
      cta: t('home.banners.b3.cta'),
      link: "/products/Apple"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[400px] overflow-hidden rounded-lg group shadow-sm border border-neutral-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentIndex].url})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-12">
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-bold tracking-wider text-xs md:text-sm mb-1"
            >
              {images[currentIndex].title}
            </motion.p>
            <motion.h2
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white text-2xl md:text-4xl font-bold mb-3 leading-tight max-w-md"
            >
              {images[currentIndex].subtitle}
            </motion.h2>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-300 text-sm max-w-sm mb-5 line-clamp-2"
            >
              {images[currentIndex].description}
            </motion.p>
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => {
                  setSearch('');
                  navigate(images[currentIndex].link);
                }}
                className="bg-primary hover:bg-primary/90 text-white rounded-md px-6 py-2.5 text-sm font-semibold transition-all inline-block"
              >
                {images[currentIndex].cta}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-md bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-md bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-6' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
