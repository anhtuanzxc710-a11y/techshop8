import React, { useContext } from 'react';
import { typeOfProductData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import { AppContext } from '../context/AppContext';

const TypeOfDevice = () => {
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);

  const handleNavigate = (category) => {
    localStorage.setItem('category', JSON.stringify([category]));
    setSearch('');
    navigate('/products');
  };

  return (
    <section className="section-sm" id="type">
      <SectionHeader 
        title="Danh mục sản phẩm" 
        subtitle="Chọn loại sản phẩm bạn quan tâm để bắt đầu mua sắm"
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {typeOfProductData.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              handleNavigate(item.type);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group cursor-pointer"
          >
            <div className="card-hover p-6 flex flex-col items-center gap-4 bg-white border border-neutral-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-neutral-50 group-hover:bg-primary-50 transition-colors">
                <img
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform duration-500 group-hover:scale-110"
                  src={item.image}
                  alt={item.type}
                />
              </div>
              <p className="text-sm font-semibold text-neutral-700 group-hover:text-primary-600 transition-colors text-center">
                {item.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TypeOfDevice;

