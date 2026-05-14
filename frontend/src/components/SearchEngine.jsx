import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchEngine = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const { products } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(search || '');
  }, [search]);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    const trimmed = searchTerm.trim();
    setSearch(trimmed);
    setShowDropdown(false);
    if (trimmed) {
      navigate('/products');
    }
  };

  const handleProductClick = (id) => {
    setShowDropdown(false);
    setSearch('');
    navigate(`/detail/${id}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-[100]">
      <div className="flex items-center w-full bg-white rounded-lg overflow-hidden border border-neutral-300 focus-within:border-primary transition-colors">
        <input
          type="text"
          placeholder={t('common.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.trimStart())}
          onFocus={() => searchTerm.trim().length > 0 && setShowDropdown(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          className="flex-1 px-4 py-2.5 text-sm text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400"
        />
        {searchTerm && (
          <button onClick={() => {setSearchTerm(''); setSearch('');}} className="p-1 text-neutral-400 hover:text-neutral-600 mr-1">
            <X size={16} />
          </button>
        )}
        <button
          onClick={handleSearchClick}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Live Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-fadeIn">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => handleProductClick(item._id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-50 last:border-0"
                >
                  <img src={item.image_url} alt="" className="w-12 h-12 object-contain rounded-lg bg-white border border-neutral-100" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800 line-clamp-1">{item.name}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{new Intl.NumberFormat('vi-VN').format(item.price)}₫</p>
                  </div>
                </div>
              ))}
              <div 
                onClick={handleSearchClick}
                className="w-full text-center py-3 bg-neutral-50 text-sm font-bold text-primary hover:bg-neutral-100 cursor-pointer transition-colors mt-1 border-t border-neutral-100"
              >
                Xem tất cả kết quả
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">
              Không tìm thấy sản phẩm nào phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchEngine;
