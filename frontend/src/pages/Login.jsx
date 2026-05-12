import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Github, Chrome, KeyRound, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { backendurl, token, setToken, sendChangePassword } = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [againPassword, setAgainPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === 'Sign Up') {
        if (againPassword !== password) {
          toast.error("Mật khẩu nhập lại không đúng!");
          setLoading(false);
          return;
        }

        const { data } = await axios.post(backendurl + '/api/user/register', {
          username,
          password,
          email,
        });

        if (data && data.success) {
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          setState('Login');
          setPassword('');
          setAgainPassword('');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendurl + '/api/user/login', {
          password,
          email,
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success("Đăng nhập thành công!");
          setPassword('');
          setEmail('');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      await sendChangePassword(forgotEmail);
      toast.success("Kiểm tra email để xác nhận đổi mật khẩu");
      setShowForgotPasswordModal(false);
      setForgotEmail('');
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi email");
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${assets.bg})` }}
    >
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForgotPasswordModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-sm relative z-10"
            >
              <button 
                onClick={() => setShowForgotPasswordModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Quên mật khẩu?</h2>
                <p className="text-neutral-500 text-sm mt-2">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="Địa chỉ Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    required
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  className="w-full btn-primary rounded-2xl py-4 font-black shadow-glow"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-white/20"
      >
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-900 mb-2">
              {state === 'Sign Up' ? 'Tạo tài khoản' : 'Đăng nhập'}
            </h2>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
              {state === 'Sign Up' 
                ? 'Đăng ký để khám phá những thiết bị công nghệ mới nhất.' 
                : 'Vui lòng đăng nhập để tiếp tục trải nghiệm mua sắm.'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <AnimatePresence mode="wait">
              {state === 'Sign Up' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      onChange={(e) => setUsername(e.target.value)}
                      value={username}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                placeholder="Địa chỉ Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <AnimatePresence>
              {state === 'Sign Up' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    onChange={(e) => setAgainPassword(e.target.value)}
                    value={againPassword}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-xs font-medium text-neutral-500 cursor-pointer">Ghi nhớ đăng nhập</label>
              </div>
              {state === 'Login' && (
                <button 
                  type="button" 
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-primary rounded-2xl py-4 font-black flex items-center justify-center gap-2 shadow-glow group"
            >
              {state === 'Sign Up' ? 'Đăng ký ngay' : 'Đăng nhập'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
              <span className="relative bg-white/0 px-4 text-[10px] uppercase font-black text-neutral-400 tracking-widest">Hoặc đăng nhập với</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors font-bold text-xs text-neutral-700">
                <Chrome className="w-4 h-4 text-error" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors font-bold text-xs text-neutral-700">
                <Github className="w-4 h-4" /> Github
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-neutral-500 font-medium">
              {state === 'Sign Up' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button
                onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
                className="ml-2 text-primary font-black hover:underline underline-offset-4"
              >
                {state === 'Sign Up' ? 'Đăng nhập tại đây' : 'Đăng ký ngay'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
