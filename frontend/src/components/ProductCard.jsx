import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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

  const discount = product.bestseller ? 15 : null;
  const originalPrice = discount ? Math.round(product.price / (1 - discount / 100)) : null;

  return (
    <div
      className="product-card group flex flex-col h-full cursor-pointer relative"
      onClick={handleProductClick}
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
          -{discount}%
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 pt-2">
        {/* Brand */}
        <span className="text-[11px] font-semibold text-primary uppercase mb-1">{product.brand}</span>

        {/* Name */}
        <h3 className="text-[13px] font-semibold text-neutral-800 leading-snug line-clamp-2 min-h-[36px] mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="price-text font-bold text-base">
              {new Intl.NumberFormat('vi-VN').format(product.price)}₫
            </span>
            {originalPrice && (
              <span className="text-neutral-400 text-xs line-through">
                {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-1.5">
            {product.available !== false ? (
              <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Còn hàng
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400 font-medium">Hết hàng</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95 border border-primary/20 hover:border-primary"
        >
          <ShoppingCart size={14} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
