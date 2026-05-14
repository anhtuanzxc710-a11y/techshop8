import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
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
    if (product.stock_quantity <= 0) {
      toast.error("Sản phẩm này đã hết hàng!");
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
      className="product-card group flex flex-col h-full cursor-pointer relative bg-white border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
      onClick={handleProductClick}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discount && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            GIẢM {discount}%
          </span>
        )}
        {product.bestseller && (
          <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            BÁN CHẠY
          </span>
        )}
      </div>

      {/* Image with Overlay */}
      <div className="relative aspect-square bg-neutral-50 flex items-center justify-center p-6 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
          loading="lazy"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-lg shadow-lg hover:bg-primary/90 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <ShoppingCart size={14} /> Thêm nhanh
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand */}
        <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">{product.brand}</span>

        {/* Name */}
        <h3 className="text-[13px] font-semibold text-neutral-800 leading-snug line-clamp-2 min-h-[36px] mb-3 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
            <span className="text-primary font-bold text-base">
              {new Intl.NumberFormat('vi-VN').format(product.price)}₫
            </span>
            {originalPrice && (
              <span className="text-neutral-400 text-xs line-through font-medium">
                {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
              </span>
            )}
          </div>

          {/* Stock status */}
          <div>
            {product.available !== false ? (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span> CÒN HÀNG
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full inline-block"></span> HẾT HÀNG
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
