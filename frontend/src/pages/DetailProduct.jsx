import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';
import { ShoppingCart, Star, MessageSquare, ShieldCheck, Truck, RotateCcw, Edit3, Send, ShoppingBag, ChevronRight, Zap } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const DetailProduct = () => {
  const { products, backendurl, userData, token, replies, setCartCount } = useContext(AppContext);
  const navigate = useNavigate();
  const { prID } = useParams();

  const [pr, setPr] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [userComment, setUserComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const checkUserEligibility = async () => {
      if (token && userData && prID) {
        try {
          const { data } = await axios.post(`${backendurl}/api/comment/check-eligibility`, {
            userId: userData._id,
            productId: prID
          }, { headers: { token } });
          setIsEligible(data.isEligible);
        } catch (error) {
          console.error("Error checking eligibility:", error);
        }
      }
    };
    checkUserEligibility();
  }, [token, userData, prID, backendurl]);

  useEffect(() => {
    if (prID && products.length > 0) {
      const prInfo = products.find(p => String(p._id) === String(prID));
      if (prInfo) {
        setPr(prInfo);
        setCategory(prInfo.category);
        setLoading(false);
      }
    }
  }, [prID, products]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!prID) return;
      try {
        const res = await axios.get(`${backendurl}/api/comment/get-comments-by-product/${prID}`);
        setAllComments(res.data);
        if (userData) {
          const userExistingComment = res.data.find(comment => comment.userId === userData._id);
          if (userExistingComment) {
            setUserComment(userExistingComment);
            setCommentText(userExistingComment.text);
            setRating(userExistingComment.rating || 5);
          }
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [prID, userData, backendurl]);

  const handleAddToCart = () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
    } else {
      const cartData = { prID, quantity };
      localStorage.setItem('cartData', JSON.stringify(cartData));
      navigate('/checkout', { state: cartData });
    }
  };

  const handleAddToShoppingCart = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập!");
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.post(`${backendurl}/api/shopping-cart/add`, { productId: prID, quantity }, { headers: { token } });
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

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      let res;
      res = await axios.post(`${backendurl}/api/comment/update-comment`, {
        userId: userData._id,
        productId: prID,
        text: commentText,
        rating: rating,
      }, { headers: { token } });

      toast.success(userComment ? "Bình luận đã được cập nhật!" : "Bình luận đã được thêm!");

      const response = await axios.get(`${backendurl}/api/comment/get-comments-by-product/${prID}`);
      setAllComments(response.data);
      if (!userComment) {
        setUserComment(res.data.comment);
      }
      setEditing(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Có lỗi xảy ra khi xử lý bình luận!");
    }
  };

  const avgRating = allComments.length > 0
    ? (allComments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / allComments.length).toFixed(1)
    : 0;

  if (loading || !pr) {
    return (
      <div className="container-main py-6">
        <Skeleton className="w-48 h-4 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Skeleton className="aspect-square rounded-lg" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-8" />
            <Skeleton className="w-full h-32 rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-10 rounded-md" />
              <Skeleton className="flex-1 h-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-10">
      <div className="container-main py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Trang chủ</span>
          <ChevronRight size={12} />
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/products')}>{pr.category}</span>
          <ChevronRight size={12} />
          <span className="text-neutral-600 font-medium truncate max-w-[200px]">{pr.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Image */}
            <div className="lg:col-span-5">
              <div className="aspect-square rounded-lg bg-neutral-50 flex items-center justify-center p-6 border border-neutral-100 relative overflow-hidden group">
                <img
                  src={pr.image_url}
                  alt={pr.name}
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                {pr.bestseller && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded">Best Seller</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="lg:col-span-7">
              {/* Brand & Category tags */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary text-xs font-semibold">{pr.brand}</span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-400 text-xs">{pr.category}</span>
              </div>

              {/* Product Name */}
              <h1 className="text-lg font-bold text-neutral-900 mb-3 leading-snug">{pr.name}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(avgRating) ? 'text-amber-400 fill-current' : 'text-neutral-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-amber-600">{avgRating > 0 ? avgRating : '5.0'}</span>
                <span className="text-xs text-neutral-400">({allComments.length} đánh giá)</span>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Còn hàng
                </span>
              </div>

              {/* Price Box */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-100">
                <div className="flex items-baseline gap-3">
                  <span className="price-text text-2xl font-bold">
                    {new Intl.NumberFormat('vi-VN').format(pr.price)}₫
                  </span>
                  {pr.bestseller && (
                    <span className="text-neutral-400 text-sm line-through">
                      {new Intl.NumberFormat('vi-VN').format(Math.round(pr.price * 1.15))}₫
                    </span>
                  )}
                  {pr.bestseller && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">-15%</span>
                  )}
                </div>
              </div>

              {/* Trust badges inline */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> Chính hãng 100%</span>
                <span className="flex items-center gap-1.5"><Truck size={14} className="text-primary" /> Giao hàng toàn quốc</span>
                <span className="flex items-center gap-1.5"><RotateCcw size={14} className="text-primary" /> Đổi trả 30 ngày</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-neutral-700">Số lượng:</span>
                <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors font-semibold text-neutral-600"
                  >-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-8 text-center font-semibold text-neutral-900 bg-transparent border-x border-neutral-200 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors font-semibold text-neutral-600"
                  >+</button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToShoppingCart}
                  className="flex-1 px-4 py-2.5 rounded-md border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart size={16} /> Thêm vào giỏ
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-[1.5] btn-primary px-4 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <Zap size={16} /> Mua ngay
                </button>
              </div>

              {/* Description */}
              {pr.description && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 leading-relaxed">{pr.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specs & Reviews */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Specs + Reviews */}
          <div className="lg:col-span-8 space-y-6">
            {/* Specifications */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  Thông số kỹ thuật
                </h3>
              </div>
              <div className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {pr.specifications && Object.keys(pr.specifications).length > 0 ? (
                      Object.entries(pr.specifications).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-neutral-50/50' : 'bg-white'}>
                          <td className="px-5 py-2.5 font-semibold text-neutral-700 w-1/3 text-xs">{key}</td>
                          <td className="px-5 py-2.5 text-neutral-500 text-xs">{value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-6 text-center text-neutral-400 text-xs italic">Thông số kỹ thuật đang được cập nhật</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  Đánh giá sản phẩm ({allComments.length})
                </h3>
              </div>

              <div className="p-5 space-y-5">
                {/* Comment Input */}
                {userData ? (
                  isEligible ? (
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={userData.image} alt="User" className="w-8 h-8 rounded-full border border-neutral-200" />
                        <div>
                          <span className="block text-xs font-semibold text-neutral-800">{userData.name}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                onClick={() => setRating(s)}
                                className={`w-3.5 h-3.5 cursor-pointer transition-all ${s <= rating ? 'text-amber-400 fill-current' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Cảm nhận của bạn về sản phẩm này..."
                          className="w-full p-3 bg-white border border-neutral-200 rounded-md focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all resize-none h-24 text-sm text-neutral-700"
                        />
                        <button
                          onClick={handleCommentSubmit}
                          className="absolute bottom-3 right-3 btn-primary px-4 py-1.5 flex items-center gap-1.5 rounded-md text-xs font-semibold"
                        >
                          {userComment ? <Edit3 size={13} /> : <Send size={13} />}
                          {userComment ? 'Cập nhật' : 'Gửi'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-lg p-5 text-center border border-dashed border-neutral-200">
                      <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-neutral-600">Bạn cần mua sản phẩm để đánh giá</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Hoàn tất đơn hàng để chia sẻ cảm nghĩ.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-blue-50 rounded-lg p-5 text-center border border-blue-100">
                    <p className="text-xs font-semibold text-primary mb-2">Đăng nhập để đánh giá sản phẩm</p>
                    <button
                      onClick={() => { navigate('/login'); window.scrollTo(0, 0); }}
                      className="btn-primary px-5 py-1.5 rounded-md text-xs font-semibold"
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-0 divide-y divide-neutral-100">
                  {allComments.length > 0 ? (
                    allComments.map((comment) => (
                      <div key={comment._id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <img src={comment.userData.image} alt="Avatar" className="w-8 h-8 rounded-full border border-neutral-200 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-semibold text-neutral-800">{comment.userData.name}</h4>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < (comment.rating || 0) ? 'text-amber-400 fill-current' : 'text-neutral-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{comment.text}</p>
                            
                            {/* Admin Replies */}
                            {replies?.filter(reply => reply.commentId === comment._id).map(reply => (
                              <div key={reply._id} className="mt-2 ml-3 p-3 bg-neutral-50 rounded-md border-l-2 border-primary">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[9px] font-bold">QTV</span>
                                  <span className="text-[11px] font-semibold text-neutral-700">Ban Quản Trị</span>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs text-neutral-400">Chưa có đánh giá nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
               <RelatedProducts prid={prID} category={category} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
