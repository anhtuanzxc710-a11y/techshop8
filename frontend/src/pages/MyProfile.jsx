import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Save, X, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MyProfile = () => {
  const { userData, setUserData, backendurl, token, getUserData, deleteUser } = useContext(AppContext);
  const [image, setImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  const updateProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", userData.address);
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      if (image) formData.append("image", image);

      const { data } = await axios.post(`${backendurl}/api/user/update-profile`, formData, {
        headers: { token },
      });

      if (data.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        await getUserData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin");
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);
      await deleteUser();
      toast.success("Tài khoản đã được xóa thành công!");
      localStorage.removeItem("token");
      localStorage.clear();
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error("Không thể xóa tài khoản.");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="container-main py-10 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar / Avatar */}
          <aside className="w-full md:w-80 space-y-6">
            <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-neutral-50 shadow-inner">
                  <img
                    src={image ? URL.createObjectURL(image) : userData.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEdit && (
                  <label htmlFor="image" className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer shadow-glow hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                    <input type="file" id="image" hidden onChange={(e) => setImage(e.target.files[0])} />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-black text-neutral-900 truncate">{userData.name}</h2>
              <p className="text-sm text-neutral-400 font-medium mb-8">{userData.email}</p>
              
              <div className="space-y-3">
                {!isEdit ? (
                  <button
                    onClick={() => setIsEdit(true)}
                    className="w-full btn-primary rounded-2xl py-3.5 font-black flex items-center justify-center gap-2 group"
                  >
                    <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={updateProfileData}
                      className="flex-1 btn-primary rounded-2xl py-3.5 font-black flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Lưu
                    </button>
                    <button
                      onClick={() => { setIsEdit(false); setImage(null); getUserData(); }}
                      className="px-4 bg-neutral-100 text-neutral-900 rounded-2xl hover:bg-neutral-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-3.5 text-error font-bold text-sm hover:bg-error-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Xóa tài khoản
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content / Info */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-neutral-100 shadow-sm">
              <h3 className="text-xl font-black text-neutral-900 mb-8 border-b border-neutral-50 pb-4 uppercase tracking-wider text-xs">Thông tin cá nhân</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    <User className="w-3.5 h-3.5" /> Họ và tên
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    />
                  ) : (
                    <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-900">{userData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-400 cursor-not-allowed opacity-70 border border-dashed border-neutral-200">{userData.email}</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    <Phone className="w-3.5 h-3.5" /> Số điện thoại
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    />
                  ) : (
                    <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-900">{userData.phone || "Chưa cập nhật"}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Giới tính
                  </label>
                  {isEdit ? (
                    <select
                      value={userData.gender}
                      onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    >
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  ) : (
                    <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-900">{userData.gender === 'Male' ? 'Nam' : userData.gender === 'Female' ? 'Nữ' : 'Khác'}</p>
                  )}
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    <Calendar className="w-3.5 h-3.5" /> Ngày sinh
                  </label>
                  {isEdit ? (
                    <input
                      type="date"
                      value={userData.dob}
                      onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    />
                  ) : (
                    <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-900">{userData.dob || "Chưa cập nhật"}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                    <MapPin className="w-3.5 h-3.5" /> Địa chỉ giao hàng
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      value={userData.address}
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    />
                  ) : (
                    <p className="px-4 py-3.5 bg-neutral-50 rounded-2xl text-sm font-bold text-neutral-900">{userData.address || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-error-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <AlertTriangle className="w-10 h-10 text-error" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-2">Cảnh báo quan trọng</h3>
              <p className="text-neutral-500 mb-8 leading-relaxed">Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị mất.</p>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full py-4 bg-error text-white rounded-2xl font-black shadow-glow-error hover:bg-error-600 transition-colors"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? "Đang xử lý..." : "Xác nhận xóa tài khoản"}
                </button>
                <button
                  className="w-full py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black transition-colors"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProfile;
