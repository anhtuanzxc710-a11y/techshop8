import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react'

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);

  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-12">
      {/* Top Footer */}
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              className="mb-4 w-36 cursor-pointer hover:opacity-80 transition-opacity" 
              src={assets.logo} 
              alt="TechShop" 
              onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
            />
            <p className="text-sm leading-relaxed mb-4 text-neutral-400">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                <button key={idx} className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-primary transition-all">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase">
              {t('footer.company')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: t('nav.home'), path: '/' },
                { label: t('footer.about_us'), path: '/about' },
                { label: t('footer.contact_us'), path: '/contact' },
                { label: t('footer.privacy'), path: '/privacy' }
              ].map((link) => (
                <li 
                  key={link.path}
                  className="text-sm text-neutral-400 hover:text-primary cursor-pointer transition-colors"
                  onClick={() => { navigate(link.path); setSearch(''); window.scrollTo(0, 0); }}
                >
                  {link.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase">
              Chính sách
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { icon: ShieldCheck, text: "Bảo hành chính hãng" },
                { icon: Truck, text: "Giao hàng toàn quốc" },
                { icon: RotateCcw, text: "Đổi trả trong 30 ngày" },
                { icon: CreditCard, text: "Thanh toán an toàn" },
              ].map((item, idx) => (
                <li key={idx} className="text-sm text-neutral-400 flex items-center gap-2">
                  <item.icon size={14} className="text-primary" /> {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase">
              {t('footer.get_in_touch')}
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Phone size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-neutral-400">Hotline</p>
                  <p className="text-white font-bold">0862.613.118</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Mail size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-neutral-400">Email</p>
                  <a href="mailto:tuannv7105@gmail.com" className="text-white font-semibold hover:text-primary transition-colors">tuannv7105@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-neutral-400">Địa chỉ</p>
                  <p className="text-white font-semibold">Hà Nội, Việt Nam</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-700">
        <div className="container-main py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-neutral-500 text-xs">
            Copyright © 2026 <span className="text-white font-semibold">TechShop</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-neutral-500 text-xs">
            <span className="hover:text-primary cursor-pointer transition-colors">Bảo mật</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Chính sách</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
