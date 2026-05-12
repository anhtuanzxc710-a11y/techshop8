import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { SkeletonGrid } from './SkeletonCard';

const BestSeller = () => {
  const navigate = useNavigate();
  const { backendurl, search, products } = useContext(AppContext);
  const [bestSellingLaptops, setBestSellingLaptops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        setLoading(true);
        if (products && products.length > 0) {
          const laptops = products.filter(p => p.category === 'Laptop').slice(0, 5);
          setBestSellingLaptops(laptops);
        } else {
          const res = await axios.get(`${backendurl}/api/product/get-products`, {
            params: { query: search }
          });
          const laptops = res.data.products.filter(p => p.category === 'Laptop').slice(0, 5);
          setBestSellingLaptops(laptops);
        }
      } catch (error) {
        console.error("Error fetching laptops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaptops();
  }, [backendurl, search, products]);

  return (
    <section className="section-sm">
      <SectionHeader 
        title="Laptop khuyến mãi tốt nhất" 
        subtitle="Tổng hợp các dòng Laptop hiệu năng cao với mức giá ưu đãi"
        linkTo="/products"
      />

      {loading ? (
        <SkeletonGrid count={5} />
      ) : bestSellingLaptops.length === 0 ? (
        <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-500">Chưa có sản phẩm Laptop nào được tìm thấy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {bestSellingLaptops.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSeller;

