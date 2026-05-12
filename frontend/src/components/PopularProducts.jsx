import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { SkeletonGrid } from './SkeletonCard';

const PopularProducts = () => {
  const navigate = useNavigate();
  const { backendurl, search, products } = useContext(AppContext);
  const [appleProducts, setAppleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppleProducts = async () => {
      try {
        setLoading(true);
        // Using context products if available, otherwise fetch
        if (products && products.length > 0) {
          const filtered = products.filter(p => p.brand === 'Apple').slice(0, 5);
          setAppleProducts(filtered);
        } else {
          const res = await axios.get(`${backendurl}/api/product/get-products`, {
            params: { query: search }
          });
          const filtered = res.data.products.filter(p => p.brand === 'Apple').slice(0, 5);
          setAppleProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching Apple products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppleProducts();
  }, [backendurl, search, products]);

  return (
    <section className="section-sm">
      <SectionHeader 
        title="Sản phẩm Apple nổi bật" 
        subtitle="Hệ sinh thái Apple chính hãng với chính sách bảo hành tốt nhất"
        linkTo="/products"
      />

      {loading ? (
        <SkeletonGrid count={5} />
      ) : appleProducts.length === 0 ? (
        <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-500">Chưa có sản phẩm Apple nào được tìm thấy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {appleProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularProducts;

