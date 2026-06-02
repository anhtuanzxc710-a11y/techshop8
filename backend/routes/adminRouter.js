import express from "express";
import {
  addProduct,
  adminDashboard,
  changeProductAvailability,
  getProducts,
  loginAdmin,
  updateCart,
  getAllUsers,
  toggleUserStatus,
  getUserOrders,
  getRevenueStats
} from "../controllers/adminController.js";
import authAdmin from "../middleware/authAdmin.js";
import upload from "../middleware/multer.js";
import {
  changeStatus,
  getCarts,
  removeCart,
} from "../controllers/cartController.js";
import { getAllComments } from "../controllers/commentController.js";
import {
  changeBestsellerStatus,
  detailProduct,
  updateProduct,
} from "../controllers/productController.js";
import {
  editReply,
  getAllReplies,
  removeReply,
  replyComment,
} from "../controllers/replyController.js";
import {
  createNotification,
  deleteNotification,
  getAllNotifications,
} from "../controllers/notificationController.js";
const adminRouter = express.Router();
adminRouter.post("/add-product", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), authAdmin, addProduct);
adminRouter.get("/all-products", authAdmin, getProducts);
adminRouter.get("/admin-dashboard", authAdmin, adminDashboard);
adminRouter.get("/revenue-stats", authAdmin, getRevenueStats);
adminRouter.post(
  "/update-product",
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]),
  authAdmin,
  updateProduct
);
adminRouter.post("/update-cart", authAdmin, updateCart);
adminRouter.post("/login", loginAdmin);
adminRouter.post(
  "/change-product-availability",
  authAdmin,
  changeProductAvailability
);
adminRouter.get("/all-carts", authAdmin, getCarts);
adminRouter.post("/delete-cart/:cartId", authAdmin, removeCart);
adminRouter.get("/comments", authAdmin, getAllComments);
adminRouter.post(
  "/change-bestseller-status",
  authAdmin,
  changeBestsellerStatus
);
adminRouter.post("/reply", authAdmin, replyComment);
adminRouter.get("/all-replies", authAdmin, getAllReplies);
adminRouter.post("/update-reply", authAdmin, editReply);
adminRouter.post("/remove-reply", authAdmin, removeReply);
adminRouter.get("/get-product/:prId", authAdmin, detailProduct);
adminRouter.post("/change-cart-status", authAdmin, changeStatus);
adminRouter.post("/create-notification", authAdmin, createNotification);
adminRouter.post("/delete-notification", authAdmin, deleteNotification);
adminRouter.get("/get-all-notifications", authAdmin, getAllNotifications);
adminRouter.get("/all-users", authAdmin, getAllUsers);
adminRouter.post("/toggle-user-status", authAdmin, toggleUserStatus);
adminRouter.get("/user-orders/:userId", authAdmin, getUserOrders);
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

adminRouter.get("/categories", authAdmin, getCategories);
adminRouter.post("/add-category", authAdmin, addCategory);
adminRouter.post("/update-category", authAdmin, updateCategory);
adminRouter.post("/delete-category/:id", authAdmin, deleteCategory);

export default adminRouter;
