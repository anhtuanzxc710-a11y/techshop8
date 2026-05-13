import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchEngine = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(search || '');
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(search || '');
  }, [search]);

  const handleSearchClick = () => {
    const trimmed = searchTerm.trim();
    setSearch(trimmed);
    navigate('/products');
  };

  return (
    <div className="flex items-center w-full bg-white rounded-lg overflow-hidden border border-neutral-300 focus-within:border-primary transition-colors">
      <input
        type="text"
        placeholder={t('common.search_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.trimStart())}
        onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
        className="flex-1 px-4 py-2.5 text-sm text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400"
      />
      <button
        onClick={handleSearchClick}
        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 flex items-center justify-center transition-colors flex-shrink-0"
      >
        <Search size={18} />
      </button>
    </div>
  );
};

export default SearchEngine;
