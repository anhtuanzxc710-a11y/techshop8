import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { MessageSquare, Reply, ShoppingBag, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MyComments = () => {
  const { t } = useTranslation();
  const { token, comments, replies, getComments, getRepliesByUser, backendurl, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      const { data } = await axios.post(`${backendurl}/api/comment/delete-comment`, {
        commentId: commentId
      }, { headers: { token } });
      
      if (data.success) {
        toast.success("Đánh giá đã được xóa!");
        await getComments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Có lỗi xảy ra khi xóa đánh giá!");
    }
  };

  useEffect(() => {
    (async () => {
      if (token) {
        setLoading(true);
        await getComments();
        await getRepliesByUser();
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="container-main py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-500 font-medium">{t('comments.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container-main py-10 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-neutral-900 mb-2 uppercase tracking-tight">{t('comments.title')}</h2>
        <p className="text-neutral-500 font-medium">{t('comments.subtitle')}</p>
      </div>

      {comments.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[48px] border border-dashed border-neutral-200">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-neutral-300" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">{t('comments.empty')}</h2>
          <p className="text-neutral-500 mb-8 max-w-xs mx-auto">{t('comments.empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comments.map((comment, index) => {
            const commentReplies = replies.filter(r => r.commentId === comment._id);

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={comment._id}
                className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/40 transition-all group flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={comment.productData.image_url}
                      alt="product"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{t('comments.product_label')}</p>
                    <h3 className="text-sm font-bold text-neutral-900 truncate">{comment.productData.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    title="Xóa đánh giá"
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex-1 bg-neutral-50 rounded-2xl p-4 mb-4 relative">
                  <MessageSquare className="absolute -top-2 -left-2 w-6 h-6 text-primary-100 fill-primary-50" />
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium italic">
                    "{comment.text}"
                  </p>
                </div>

                {commentReplies.length > 0 && (
                  <div className="space-y-3 mt-auto">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Reply className="w-3 h-3" /> {t('comments.admin_reply')}
                    </p>
                    {commentReplies.map((reply) => (
                      <div
                        key={reply._id}
                        className="text-xs text-neutral-600 bg-amber-50 p-3 rounded-xl border border-amber-100/50"
                      >
                        {reply.text}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyComments;


