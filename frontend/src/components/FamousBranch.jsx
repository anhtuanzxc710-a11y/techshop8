import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { branch } from '../assets/assets';
import SectionHeader from './SectionHeader';
import { AppContext } from '../context/AppContext';

const FamousBranch = () => {
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);

  const handleNavigate = (brand) => {
    localStorage.setItem('brand', JSON.stringify([brand]));  
    setSearch('');
    navigate('/products');
  };

  return (
    <section className="section-sm" id="branch">
      <SectionHeader 
        title="Thương hiệu nổi tiếng" 
        subtitle="Sản phẩm chính hãng từ những tập đoàn công nghệ hàng đầu thế giới"
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {branch.map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            onClick={() => {
              handleNavigate(item.name);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="card-hover aspect-[3/2] p-6 flex flex-col items-center justify-center bg-white border border-neutral-100 hover:border-primary-100">
              <div className="w-full h-12 sm:h-16 flex items-center justify-center overflow-hidden">
                <img 
                  className="object-contain w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                  src={item.image} 
                  alt={item.name} 
                />
              </div>
              <p className="mt-3 text-xs font-medium text-neutral-400 group-hover:text-primary-600 transition-colors">
                {item.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FamousBranch;
