import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { token, backendurl, setCartCount } = useContext(AppContext);

  if (!product) return null;

  const handleProductClick = () => {
    navigate(`/detail/${product._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/add`, { productId: product._id, quantity: 1 }, { headers: { token } });
      if (data.success) {
        toast.success("Đã thêm vào giỏ hàng!");
        if (setCartCount) setCartCount(data.totalItems);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl border border-neutral-100 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-100/30 hover:border-primary-100 flex flex-col h-full relative overflow-hidden"
    >
      {/* Badge Bestseller */}
      {product.bestseller && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Best Seller
          </span>
        </div>
      )}

      {/* Image Container */}
      <div
        className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-neutral-50 flex items-center justify-center cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
        />

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="Thêm vào giỏ hàng"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 cursor-pointer" onClick={handleProductClick}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-neutral-600">{product.rating ? product.rating.toFixed(1) : '—'}</span>
          </div>
        </div>

        <h3 className="text-neutral-900 font-bold text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-primary font-black text-lg">
              {new Intl.NumberFormat('vi-VN').format(product.price)}₫
            </span>
            {product.available ? (
              <span className="text-[10px] text-success font-bold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Sẵn hàng
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 font-bold italic">Hết hàng</span>
            )}
          </div>
          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
