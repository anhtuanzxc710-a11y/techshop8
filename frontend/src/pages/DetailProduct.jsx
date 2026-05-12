import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';
import { ShoppingCart, Star, MessageSquare, ShieldCheck, Truck, RotateCcw, Edit3, Send, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

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

      // Refresh comments
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
      <div className="container-main py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-neutral-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      {/* Product Top Section */}
      <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-sm border border-neutral-100 mb-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery Mockup */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl bg-neutral-50 flex items-center justify-center p-8 border border-neutral-100 overflow-hidden group"
            >
              <img
                src={pr.image_url}
                alt={pr.name}
                className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>

            {/* Trust Badges Detail */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-neutral-500">Chính hãng 100%</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-neutral-500">Giao nhanh 2h</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl">
                <RotateCcw className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-neutral-500">Đổi trả 30 ngày</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="badge-primary px-3 py-1 text-[10px] uppercase">{pr.brand}</span>
              <span className="badge bg-neutral-100 text-neutral-600 px-3 py-1 text-[10px] uppercase">{pr.category}</span>
              {pr.bestseller && <span className="badge bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 text-[10px] uppercase font-black">Best Seller</span>}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-4 leading-tight">{pr.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-500 font-medium">
                {avgRating > 0 ? `${avgRating}/5` : 'Chưa có đánh giá'} | {allComments.length} đánh giá
              </span>
              <span className="text-sm text-success font-bold flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" /> Đang còn hàng
              </span>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-6 mb-8">
              <p className="text-sm text-neutral-500 mb-1 font-medium">Giá bán lẻ:</p>
              <h2 className="text-4xl font-black text-primary">
                {new Intl.NumberFormat('vi-VN').format(pr.price)}₫
              </h2>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3">Số lượng:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-neutral-50 transition-colors font-bold"
                    >-</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center font-bold text-neutral-900 border-none focus:ring-0"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-4 py-2 hover:bg-neutral-50 transition-colors font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToShoppingCart}
                  className="flex-1 border-2 border-primary text-primary rounded-2xl py-5 text-lg font-black flex items-center justify-center gap-3 hover:bg-primary-50 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" /> Thêm vào giỏ
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary rounded-2xl py-5 text-lg font-black flex items-center justify-center gap-3 shadow-glow"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="mt-auto pt-6 border-t border-neutral-100">
              <p className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-widest">Mô tả ngắn:</p>
              <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                {pr.description || "Chưa có mô tả chi tiết cho sản phẩm này. Liên hệ để biết thêm thông tin."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Description & Specs */}
        <div className="flex-1 space-y-8">
          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-neutral-100">
            <h3 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-primary" /> Thông số kỹ thuật
            </h3>
            <div className="overflow-hidden rounded-2xl border border-neutral-100">
              <table className="w-full text-sm">
                <tbody>
                  {pr.specifications && Object.keys(pr.specifications).length > 0 ? (
                    Object.entries(pr.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-bold text-neutral-700 w-1/3">{key}</td>
                        <td className="px-6 py-4 text-neutral-600">{value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-center text-neutral-400 italic">Thông số đang được cập nhật</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-neutral-100">
            <h3 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-primary" /> Đánh giá & Bình luận
            </h3>

            <div className="space-y-8">
              {/* Write Comment */}
              {userData ? (
                isEligible ? (
                  <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={userData.image} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                      <span className="font-bold text-neutral-800">{userData.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-bold text-neutral-600 mr-2">Đánh giá của bạn:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setRating(s)}
                            className={`w-5 h-5 cursor-pointer transition-all ${s <= rating ? 'text-amber-400 fill-current scale-110' : 'text-neutral-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-500 ml-2">
                        {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={userComment ? "Cập nhật bình luận của bạn..." : "Chia sẻ cảm nghĩ của bạn về sản phẩm..."}
                        className="w-full p-4 bg-white border border-neutral-200 rounded-xl focus:ring-primary focus:border-primary transition-all resize-none h-32"
                      />
                      <button
                        onClick={handleCommentSubmit}
                        className="absolute bottom-4 right-4 btn-primary btn-sm flex items-center gap-2 rounded-lg"
                      >
                        {userComment ? <Edit3 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        {userComment ? 'Cập nhật' : 'Gửi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-dashed border-neutral-300">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-neutral-600 font-medium">Bạn chỉ có thể đánh giá sau khi đã mua và nhận được sản phẩm này.</p>
                    <p className="text-neutral-400 text-sm mt-1">Hãy mua hàng và trải nghiệm ngay nhé!</p>
                  </div>
                )
              ) : (
                <div className="bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
                  <p className="text-neutral-700 font-medium mb-4">Vui lòng đăng nhập để gửi bình luận của bạn</p>
                  <button
                    onClick={() => { navigate('/login'); window.scrollTo(0, 0); }}
                    className="btn-primary rounded-xl px-8"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {allComments.length > 0 ? (
                  allComments.map((comment) => (
                    <div key={comment._id} className="group pb-6 border-b border-neutral-100 last:border-0">
                      <div className="flex items-start gap-4">
                        <img src={comment.userData.image} alt="Avatar" className="w-12 h-12 rounded-2xl border border-neutral-100 shadow-sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-neutral-900">{comment.userData.name}</h4>
                            <div className="flex items-center gap-0.5 my-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < (comment.rating || 0) ? 'fill-current' : 'text-neutral-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium">Bình luận mới</span>
                          </div>
                          <p className="text-neutral-600 text-sm leading-relaxed">{comment.text}</p>

                          {/* Admin Replies */}
                          {replies?.filter(reply => reply.commentId === comment._id).length > 0 && (
                            <div className="mt-4 space-y-3">
                              {replies.filter(reply => reply.commentId === comment._id).map(reply => (
                                <div key={reply._id} className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-black uppercase">QTV</span>
                                    <span className="text-sm font-bold text-amber-900">Ban Quản Trị</span>
                                  </div>
                                  <p className="text-sm text-neutral-700 leading-relaxed">{reply.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-neutral-400">
                    <p className="italic">Chưa có bình luận nào cho sản phẩm này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Related */}
        <div className="w-full lg:w-80">
          <RelatedProducts prid={prID} category={category} />
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;

