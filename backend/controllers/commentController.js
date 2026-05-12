import commentModel from "../models/commentModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import sql from 'mssql';
import { connectDB } from "../config/database.js";
const createComment = async (req, res) => {
  try {
    const { userId, productId, text, rating = null } = req.body;

    // Kiểm tra xem người dùng đã bình luận sản phẩm này chưa
    const existingComment = await commentModel.findOne({ userId, productId });

    if (existingComment) {

      return res.status(400).json({ error: "You have already commented on this product. Please edit your comment instead." });
    }
    const productData = await productModel.findById(productId);
    const userData = await userModel.findById(userId);
    if (!productData || !userData) return res.status(400).json({ error: "User or Product not found" })
    // Tạo bình luận mới
    const newComment = await commentModel.create({ userId, productId, text, rating });

    res.status(201).json({ message: "Comment created successfully!", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment!" });
  }
};
const getAllComments = async (req, res) => {
  try {
    const comments = await commentModel.find(); // Lấy tất cả bình luận từ database
    res.status(200).json({ success: true, comments: comments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments!" });
  }
};
const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy userId từ URL
    const comments = await commentModel.find({ userId });

    if (!comments || comments.length === 0) {
      return res.status(200).json({ success: true, comments: [] });
    }

    res.status(200).json({ sucess: true, comments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments for user!" });
  }
};
const getCommentsByProduct = async (req, res) => {
  try {
    const { prID } = req.params; // Lấy productId từ URL
    if (!prID) return res.status(404).json({ error: 'productId not found' });
    const comments = await commentModel.find({ productId: prID });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments for product!" });
  }
};
const updateComment = async (req, res) => {
  try {
    const { productId, userId, text, rating } = req.body;

    if (!productId || !userId || !text.trim()) {
      return res.status(400).json({ message: 'Thiếu dữ liệu đầu vào' });
    }

    // KIỂM TRA ĐIỀU KIỆN: Chỉ cho phép nếu đơn hàng đã giao (delivered)
    const pool = await connectDB();
    const orderCheck = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .query(`
          SELECT TOP 1 o.OrderStatus 
          FROM [Order] o
          JOIN OrderItem oi ON o.OrderID = oi.OrderID
          WHERE o.UserID = @UserID AND oi.ProductID = @ProductID AND o.OrderStatus = 'delivered'
        `);

    if (orderCheck.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá sau khi đã nhận được sản phẩm này.'
      });
    }

    // Tìm bình luận của user cho sản phẩm này
    let comment = await commentModel.findOne({ productId, userId });

    if (comment) {
      // Nếu đã có bình luận, cập nhật nội dung mới
      comment = await commentModel.update({ userId, productId }, { text, rating });
      return res.status(200).json({ message: 'Bình luận đã được cập nhật', comment });
    } else {
      // Nếu chưa có bình luận, tạo mới
      comment = await commentModel.create({ productId, userId, text, rating });
      return res.status(201).json({ message: 'Bình luận đã được thêm', comment });
    }
  } catch (error) {
    console.error('Lỗi cập nhật bình luận:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const checkEligibility = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT TOP 1 o.OrderStatus 
        FROM [Order] o
        JOIN OrderItem oi ON o.OrderID = oi.OrderID
        WHERE o.UserID = @UserID AND oi.ProductID = @ProductID AND o.OrderStatus = 'delivered'
      `);

    res.json({ success: true, isEligible: result.recordset.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createComment, getAllComments, getCommentsByUser, getCommentsByProduct, updateComment, checkEligibility
}