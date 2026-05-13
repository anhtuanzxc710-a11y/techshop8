import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'lucide-react';

const Search = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(search || '');
  const navigate = useNavigate();

  const handleSearchClick = () => {
    const trimmed = searchTerm.trim();
    setSearch(trimmed);
    navigate('/products-list');
  };

  useEffect(() => {
    setSearchTerm(search || '');
  }, [search]);

  return (
    <div className="flex items-center w-full bg-neutral-50 rounded-lg border border-neutral-200 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
      <input
        type="text"
        placeholder={t('common.search_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
        className="flex-1 bg-transparent px-4 py-2 text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
      />
      <button
        onClick={handleSearchClick}
        className="p-2 mr-1 text-neutral-400 hover:text-primary transition-colors"
      >
        <SearchIcon size={16} />
      </button>
    </div>
  );
};

export default Search;