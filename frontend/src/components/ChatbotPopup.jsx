import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ChatbotPopup() {
  const { messages, addMessages, getMessages, clearMessages, token } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const handlelogintochat = () => {
    toast.warn("Log in or sign up to chat with our AI assistant !");
    navigate('/login');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await addMessages(input.trim());
    setInput('');
  };

  const handleClear = () => {
    clearMessages();
    setShowConfirm(false);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      await getMessages();
      setLoading(false);
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  return token ? (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-150 relative font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-3 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-lg animate-bounce">🤖</span>
                <h2 className="font-semibold text-sm tracking-wide">TechShop AI Assistant</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="text-xs bg-white/10 hover:bg-white/20 transition px-2 py-0.5 rounded text-white/90 font-medium"
                  title="Xoá hội thoại"
                >
                  🗑 Xóa
                </button>
                <button onClick={() => setOpen(false)} className="hover:text-red-200 transition text-lg leading-none">
                  ✖
                </button>
              </div>
            </div>

            {/* Messages */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                Đang tải tin nhắn...
              </div>
            ) : (
              <div
                className="flex-1 overflow-y-auto p-3 bg-slate-50/60"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #edf2f7',
                }}
              >
                <div className="flex flex-col space-y-3">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user' || msg.sender === 'user';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-2xl max-w-[85%] text-sm whitespace-pre-line break-words shadow-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white self-end ml-auto rounded-tr-none'
                            : 'bg-white text-gray-800 self-start rounded-tl-none border border-gray-100'
                        }`}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t bg-white flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl px-3 py-2 text-sm transition"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi..."
              />
              <button
                onClick={handleSend}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 active:scale-95 transition shadow-sm font-medium text-sm"
              >
                Gửi
              </button>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-5 rounded-2xl shadow-2xl w-72 max-h-[80%] overflow-y-auto space-y-4 text-center border border-gray-100">
                  <p className="font-medium text-gray-800">Xoá toàn bộ tin nhắn?</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleClear}
                      className="bg-red-500 text-white px-4 py-1.5 rounded-xl hover:bg-red-600 transition text-sm font-medium"
                    >
                      Có
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Không
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition flex items-center gap-2 font-semibold tracking-wide"
        >
          <span>Chat với AI</span> 🤖
        </button>
      )}
    </div>
  ) : (
    <div
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition flex items-center gap-2 font-semibold tracking-wide cursor-pointer"
      onClick={() => {
        handlelogintochat();
        scrollTo(0, 0);
      }}
    >
      <span>Chat với AI</span> 🤖
    </div>
  );
}
