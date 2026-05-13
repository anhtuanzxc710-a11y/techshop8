import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Zap, Heart, Target, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="container-main py-12 lg:py-20">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <img 
              className="w-full rounded-[48px] shadow-premium relative z-10 border border-white/20" 
              src={assets.about} 
              alt="About TechShop" 
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-[32px] shadow-2xl z-20 border border-neutral-100 hidden md:block">
               <p className="text-4xl font-black text-primary">10K+</p>
               <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Khách hàng tin dùng</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-8"
        >
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 block">Câu chuyện của chúng tôi</span>
            <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tighter leading-tight">
              Định nghĩa lại trải nghiệm <span className="text-primary">Công nghệ</span>
            </h1>
          </div>
          
          <div className="space-y-6 text-neutral-500 font-medium leading-relaxed">
            <p>Chào mừng bạn đến với <strong>TechShop</strong>, điểm đến tin cậy cho những sản phẩm và phụ kiện công nghệ hàng đầu. Chúng tôi hiểu rằng công nghệ không chỉ là thiết bị, mà là cầu nối giúp bạn làm việc, giải trí và kết nối mọi lúc mọi nơi.</p>
            <p>Tại TechShop, chúng tôi cam kết mang đến sự xuất sắc trong từng sản phẩm. Đội ngũ chuyên gia luôn cập nhật những xu hướng và cải tiến mới nhất, đảm bảo bạn luôn được trải nghiệm những gì tinh túy nhất của kỷ nguyên số.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6">
             <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-4">
                   <Target size={24} />
                </div>
                <h3 className="text-lg font-black text-neutral-900">Tầm nhìn</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Đưa công nghệ trở nên gần gũi và thú vị hơn với tất cả mọi người.</p>
             </div>
             <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-4">
                   <Heart size={24} />
                </div>
                <h3 className="text-lg font-black text-neutral-900">Sứ mệnh</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Cung cấp giải pháp công nghệ tối ưu và tư vấn chuyên nghiệp nhất.</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Why Choose Us */}
      <div className="relative py-20 px-8 lg:px-20 bg-neutral-900 rounded-[64px] overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
         <div className="relative z-10">
            <div className="text-center mb-16">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block">Lý do chọn TechShop</span>
               <h2 className="text-4xl font-black text-white tracking-tight">Giá trị chúng tôi mang lại</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { icon: Zap, title: "Hiệu quả tối ưu", desc: "Trải nghiệm mua sắm mượt mà, giúp bạn tìm thấy thiết bị hoàn hảo chỉ trong vài cú nhấp chuột." },
                 { icon: ShieldCheck, title: "Tiện lợi tuyệt đối", desc: "Mua sắm mọi lúc mọi nơi với chính sách giao hàng nhanh chóng và bảo mật thông tin tuyệt đối." },
                 { icon: Sparkles, title: "Cá nhân hóa", desc: "Những gợi ý thông minh dựa trên sở thích và phong cách sống giúp bạn luôn bắt kịp xu hướng." }
               ].map((item, i) => (
                 <div key={i} className="space-y-4 p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/card">
                   <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow group-hover/card:scale-110 transition-transform duration-500">
                     <item.icon size={28} />
                   </div>
                   <h4 className="text-xl font-black text-white">{item.title}</h4>
                   <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;

