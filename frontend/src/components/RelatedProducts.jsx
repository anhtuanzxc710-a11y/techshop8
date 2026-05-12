import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from './ProductCard';

const RelatedProducts = (props) => {
  const { products } = useContext(AppContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0 && props.category) {
      let filter = products.filter(pr => pr._id !== props.prid && pr.category === props.category);
      setRelated(filter.slice(0, 4));
    }
  }, [products, props.category, props.prid]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-neutral-900 px-2 uppercase tracking-tight">Gợi ý cho bạn</h3>
      
      <div className="flex flex-col gap-4">
        {related.length > 0 ? (
          related.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))
        ) : (
          <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 mx-2">
            <p className="text-xs text-neutral-400 italic">Không có sản phẩm liên quan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
