import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, subtitle, linkTo }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-tight mb-2 uppercase tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-neutral-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {linkTo && (
        <Link 
          to={linkTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-600 transition-colors group"
        >
          Xem tất cả 
          <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
