import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "products": "Products",
        "about": "About",
        "contact": "Contact",
        "login": "Login",
        "logout": "Logout",
        "profile": "Profile",
        "orders": "Orders",
        "my_comments": "My Comments"
      },
      "notifications": {
        "title": "Notifications",
        "empty": "No notifications",
        "mark_all": "Mark all as read",
        "new": "New notification",
        "old": "Old notification",
        "detail": "Notification Detail",
        "receiver": "Receiver",
        "by": "By",
        "time": "Time",
        "you": "You",
        "admin": "Admin",
        "notify": "Notification"
      },
      "home": {
        "shipping_title": "Fast Delivery",
        "shipping_desc": "Free from 500K",
        "warranty_title": "Original Warranty",
        "warranty_desc": "100% Genuine",
        "return_title": "Easy Returns",
        "return_desc": "Within 30 days",
        "support_title": "24/7 Support",
        "support_desc": "Dedicated service",
        "sale_title": "Tech Sale Hunt",
        "sale_desc": "Up to 50% off for Gaming Laptops this week.",
        "view_now": "View Now"
      },
      "cart": {
        "title": "Your Cart",
        "empty": "Your cart is empty",
        "checkout": "Checkout",
        "total": "Total",
        "shipping": "Shipping",
        "free": "Free"
      },
      "order": {
        "history": "Order History",
        "status": "Status",
        "id": "Order ID",
        "date": "Date",
        "paid": "PAID",
        "cancel": "Cancel",
        "received": "Confirm Received",
        "back_to_list": "Back to order list"
      },
      "orders": {
        "pending": "Pending",
        "processing": "Processing",
        "shipped": "Shipped",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "noti_deleted": "The cart (id: #{{id}}) that has {{items}} item(s) of {{name}} you ordered has been deleted by admin.",
        "noti_updated": "The cart (id: #{{id}}) that has {{items}} item(s) of {{name}} was updated to {{status}} by admin."
      },
      "order_detail": {
        "title": "Order Detail",
        "status": "Order Status",
        "id": "Order ID",
        "confirm_received": "Confirm Received",
        "purchased_products": "Purchased Products",
        "quantity": "Quantity",
        "rate_now": "Rate Now",
        "rated": "Rated",
        "shipping_address": "Shipping Address",
        "payment_details": "Payment Details",
        "subtotal": "Subtotal",
        "discount": "Discount",
        "shipping_fee": "Shipping Fee",
        "total": "Total",
        "payment_method": "Payment Method",
        "cod": "Cash on Delivery (COD)",
        "rate_product": "Rate Product",
        "share_experience": "Share your experience about this product...",
        "submit_review": "Submit Review",
        "cancel": "Cancel",
        "not_found": "Order not found",
        "back": "Back",
        "confirm_received_msg": "Do you confirm that you have received this package?",
        "pending": "Pending",
        "processing": "Processing",
        "confirmed": "Confirmed",
        "shipped": "Shipped",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "rate_success": "Thank you for your rating!"
      },
      "common": {
        "add_to_cart": "Add to Cart",
        "buy_now": "Buy Now",
        "search": "Search...",
        "welcome": "Welcome back",
        "all_products": "All Products",
        "bestseller": "Best Seller",
        "popular": "Popular",
        "filter": "Filter",
        "clear_filter": "Clear Filter",
        "sort_default": "Default",
        "sort_newest": "Newest",
        "sort_oldest": "Oldest",
        "sort_price_asc": "Price: Low to High",
        "sort_price_desc": "Price: High to Low",
        "no_products": "No products found",
        "results": "results",
        "search_placeholder": "Search for anything",
        "loading": "Loading..."
      },
      "footer": {
        "desc": "Our Company specializes in providing the latest technology devices at market prices. Our quality sales and warranty system makes us the top choice for online shopping of technology devices.",
        "company": "Company",
        "about_us": "About us",
        "contact_us": "Contact us",
        "privacy": "Privacy policy",
        "get_in_touch": "GET IN TOUCH",
        "phone": "Phone number"
      },
      "comments": {
        "title": "Your Feedback",
        "subtitle": "Review all your ratings and discussions about products.",
        "empty": "You have no comments yet",
        "empty_desc": "Share your thoughts about products you have experienced.",
        "product_label": "Product",
        "admin_reply": "Reply from Admin",
        "loading": "Loading your comments..."
      },
      "filter": {
        "category": "Category",
        "brand": "Brand",
        "price_range": "Price Range",
        "price_under_1m": "Under 1M",
        "price_1_5m": "1 - 5M",
        "price_5_15m": "5 - 15M",
        "price_15_30m": "15 - 30M",
        "price_30_50m": "30 - 50M",
        "price_over_50m": "Over 50M"
      }
    }
  },
  vi: {
    translation: {
      "nav": {
        "home": "Trang chủ",
        "products": "Sản phẩm",
        "about": "Giới thiệu",
        "contact": "Liên hệ",
        "login": "Đăng nhập",
        "logout": "Đăng xuất",
        "profile": "Cá nhân",
        "orders": "Đơn hàng",
        "my_comments": "Bình luận của tôi"
      },
      "notifications": {
        "title": "Thông báo",
        "empty": "Không có thông báo",
        "mark_all": "Đánh dấu tất cả đã đọc",
        "new": "Thông báo mới",
        "old": "Thông báo cũ",
        "detail": "Chi tiết thông báo",
        "receiver": "Người nhận",
        "by": "Gửi bởi",
        "time": "Thời gian",
        "you": "Bạn",
        "admin": "Quản trị viên",
        "notify": "Thông báo"
      },
      "home": {
        "shipping_title": "Giao hàng nhanh",
        "shipping_desc": "Miễn phí đơn từ 500K",
        "warranty_title": "Bảo hành chính hãng",
        "warranty_desc": "Cam kết 100% chính hãng",
        "return_title": "Đổi trả dễ dàng",
        "return_desc": "Trong vòng 30 ngày",
        "support_title": "Hỗ trợ 24/7",
        "support_desc": "Tận tâm & chuyên nghiệp",
        "sale_title": "Săn Sale Công Nghệ",
        "sale_desc": "Giảm tới 50% cho các dòng Laptop Gaming trong tuần lễ khai trương.",
        "view_now": "Xem ngay"
      },
      "cart": {
        "title": "Giỏ hàng",
        "empty": "Giỏ hàng của bạn đang trống",
        "checkout": "Thanh toán",
        "total": "Tổng cộng",
        "shipping": "Phí vận chuyển",
        "free": "Miễn phí"
      },
      "order": {
        "history": "Lịch sử đơn hàng",
        "status": "Trạng thái",
        "id": "Mã đơn hàng",
        "date": "Ngày đặt",
        "paid": "ĐÃ THANH TOÁN",
        "cancel": "Hủy đơn",
        "received": "Đã nhận hàng",
        "back_to_list": "Quay lại danh sách đơn hàng"
      },
      "orders": {
        "pending": "Chờ xác nhận",
        "processing": "Đang xử lý",
        "shipped": "Đang giao hàng",
        "delivered": "Đã nhận hàng",
        "cancelled": "Đã hủy",
        "noti_deleted": "Giỏ hàng (id: #{{id}}) với {{items}} sản phẩm {{name}} bạn đã đặt đã bị xóa bởi quản trị viên.",
        "noti_updated": "Giỏ hàng (id: #{{id}}) với {{items}} sản phẩm {{name}} đã được cập nhật thành {{status}} bởi quản trị viên."
      },
      "order_detail": {
        "title": "Chi tiết đơn hàng",
        "status": "Trạng thái đơn hàng",
        "id": "Mã đơn hàng",
        "confirm_received": "Xác nhận đã nhận hàng",
        "purchased_products": "Sản phẩm đã mua",
        "quantity": "Số lượng",
        "rate_now": "Đánh giá ngay",
        "rated": "Đã đánh giá",
        "shipping_address": "Địa chỉ giao hàng",
        "payment_details": "Chi tiết thanh toán",
        "subtotal": "Tạm tính",
        "discount": "Giảm giá",
        "shipping_fee": "Phí vận chuyển",
        "total": "Tổng cộng",
        "payment_method": "Phương thức thanh toán",
        "cod": "Thanh toán khi nhận hàng (COD)",
        "rate_product": "Đánh giá sản phẩm",
        "share_experience": "Chia sẻ trải nghiệm của bạn về sản phẩm này...",
        "submit_review": "Gửi đánh giá",
        "cancel": "Hủy",
        "not_found": "Không tìm thấy đơn hàng",
        "back": "Quay lại",
        "confirm_received_msg": "Bạn xác nhận đã nhận được kiện hàng này?",
        "pending": "Chờ xác nhận",
        "processing": "Đang xử lý",
        "confirmed": "Đã xác nhận",
        "shipped": "Đang giao hàng",
        "delivered": "Đã nhận hàng",
        "cancelled": "Đã hủy",
        "rate_success": "Cảm ơn bạn đã đánh giá sản phẩm!"
      },
      "common": {
        "add_to_cart": "Thêm vào giỏ",
        "buy_now": "Mua ngay",
        "search": "Tìm kiếm...",
        "welcome": "Chào mừng quay trở lại",
        "all_products": "Tất cả sản phẩm",
        "bestseller": "Sản phẩm bán chạy",
        "popular": "Phổ biến",
        "filter": "Bộ lọc",
        "clear_filter": "Xóa lọc",
        "sort_default": "Mặc định",
        "sort_newest": "Mới nhất",
        "sort_oldest": "Cũ nhất",
        "sort_price_asc": "Giá: Thấp đến Cao",
        "sort_price_desc": "Giá: Cao đến Thấp",
        "no_products": "Không tìm thấy sản phẩm",
        "results": "kết quả",
        "search_placeholder": "Tìm kiếm sản phẩm...",
        "loading": "Đang tải..."
      },
      "footer": {
        "desc": "Công ty chúng tôi chuyên cung cấp các thiết bị công nghệ mới nhất với giá thị trường. Hệ thống bán hàng và bảo hành chất lượng khiến chúng tôi trở thành lựa chọn hàng đầu cho việc mua sắm trực tuyến các thiết bị công nghệ.",
        "company": "Công ty",
        "about_us": "Giới thiệu",
        "contact_us": "Liên hệ",
        "privacy": "Chính sách bảo mật",
        "get_in_touch": "LIÊN LẠC",
        "phone": "Số điện thoại"
      },
      "comments": {
        "title": "Phản hồi của bạn",
        "subtitle": "Xem lại tất cả các đánh giá và thảo luận của bạn về các sản phẩm.",
        "empty": "Bạn chưa có bình luận nào",
        "empty_desc": "Hãy chia sẻ cảm nghĩ của bạn về các sản phẩm đã trải nghiệm nhé.",
        "product_label": "Sản phẩm",
        "admin_reply": "Phản hồi từ Admin",
        "loading": "Đang tải bình luận của bạn..."
      },
      "filter": {
        "category": "Danh mục",
        "brand": "Thương hiệu",
        "price_range": "Khoảng giá",
        "price_under_1m": "Dưới 1 triệu",
        "price_1_5m": "1 - 5 triệu",
        "price_5_15m": "5 - 15 triệu",
        "price_15_30m": "15 - 30 triệu",
        "price_30_50m": "30 - 50 triệu",
        "price_over_50m": "Trên 50 triệu"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
