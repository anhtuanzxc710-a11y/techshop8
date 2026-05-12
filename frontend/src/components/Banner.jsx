import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Banner = () => {
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);
  const images = [
    {
      url: assets.banner2,
      title: "CÔNG NGHỆ MỚI",
      subtitle: "Đỉnh Cao Hiệu Năng",
      description: "Khám phá các dòng Laptop và Smartphone mới nhất với ưu đãi lên tới 30%.",
      cta: "Mua ngay",
      link: "/products"
    },
    {
      url: assets.banner1,
      title: "GAMING GEAR",
      subtitle: "Bứt Phá Giới Hạn",
      description: "Trang bị tốt nhất cho game thủ chuyên nghiệp. Giảm giá sốc cho phụ kiện.",
      cta: "Xem ưu đãi",
      link: "/products/Accessory"
    },
    {
      url: assets.banner3,
      title: "APPLE ECOSYSTEM",
      subtitle: "Sang Trọng & Đẳng Cấp",
      description: "Trải nghiệm hệ sinh thái Apple hoàn hảo. Hỗ trợ trả góp 0%.",
      cta: "Khám phá",
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
    <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] overflow-hidden rounded-2xl mb-8 group shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentIndex].url})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="relative h-full container-main flex flex-col justify-center px-8 md:px-16">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-400 font-bold tracking-widest text-xs md:text-sm mb-2"
            >
              {images[currentIndex].title}
            </motion.p>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white text-3xl md:text-5xl font-black mb-4 leading-tight max-w-lg"
            >
              {images[currentIndex].subtitle}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-300 text-sm md:text-base max-w-md mb-8 line-clamp-2"
            >
              {images[currentIndex].description}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => {
                  setSearch('');
                  navigate(images[currentIndex].link);
                }}
                className="btn-primary rounded-full px-8 py-3 text-sm font-bold shadow-glow inline-block"
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
        className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
