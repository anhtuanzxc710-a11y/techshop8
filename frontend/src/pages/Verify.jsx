import { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Verify() {
  const navigate = useNavigate();
  const { setToken, backendurl } = useContext(AppContext);

  useEffect(() => {
    const tokenGmail = new URLSearchParams(window.location.search).get('tokenGmail');
    if (!tokenGmail) {
      toast.error('Không tìm thấy token xác thực!');
      navigate('/login');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${backendurl}/api/user/verify?tokenGmail=${tokenGmail}`);
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
          toast.success('Xác thực thành công!');
          setTimeout(() => navigate('/'), 2000);
        } else {
          toast.error('Token không hợp lệ hoặc đã hết hạn!');
          navigate('/login');
        }
      } catch (err) {
        toast.error('Lỗi khi xác thực. Vui lòng thử lại sau.');
        navigate('/login');
      }
    };

    verifyEmail();
  }, [navigate, backendurl, setToken]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center container-main">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 bg-white rounded-[48px] border border-neutral-100 shadow-xl shadow-neutral-200/50 max-w-sm w-full"
      >
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-primary-50 rounded-full"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Đang xác thực</h2>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra thông tin tài khoản của bạn.
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin" /> Hệ thống bảo mật
        </div>
      </motion.div>
    </div>
  );
}

