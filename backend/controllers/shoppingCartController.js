import shoppingCartModel from "../models/shoppingCartModel.js";
import productModel from "../models/productModel.js";

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const items = await shoppingCartModel.getCartByUser(userId);
    const totalItems = await shoppingCartModel.getItemCount(userId);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    res.json({
      success: true,
      items,
      totalItems,
      totalPrice
    });

  } catch (error) {
    console.error("getCart error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

// Thêm sản phẩm vào giỏ
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Sản phẩm không tồn tại"
      });
    }

    if (!product.available) {
      return res.json({
        success: false,
        message: "Sản phẩm đã hết hàng"
      });
    }

    const items = await shoppingCartModel.addItem(
      userId,
      productId,
      quantity || 1
    );

    const totalItems = await shoppingCartModel.getItemCount(userId);

    res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      items,
      totalItems
    });

  } catch (error) {
    console.error("addToCart error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

// Cập nhật số lượng
const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const items = await shoppingCartModel.updateQuantity(
      userId,
      productId,
      quantity
    );

    const totalItems = await shoppingCartModel.getItemCount(userId);

    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    res.json({
      success: true,
      items,
      totalItems,
      totalPrice
    });

  } catch (error) {
    console.error("updateCartItem error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

// Xóa sản phẩm khỏi giỏ
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const items = await shoppingCartModel.removeItem(
      userId,
      productId
    );

    const totalItems = await shoppingCartModel.getItemCount(userId);

    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    res.json({
      success: true,
      message: "Đã xóa khỏi giỏ hàng",
      items,
      totalItems,
      totalPrice
    });

  } catch (error) {
    console.error("removeFromCart error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    await shoppingCartModel.clearCart(userId);

    res.json({
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng"
    });

  } catch (error) {
    console.error("clearCart error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

// Đếm items
const getCartCount = async (req, res) => {
  try {
    const { userId } = req.body;

    const totalItems = await shoppingCartModel.getItemCount(userId);

    res.json({
      success: true,
      totalItems
    });

  } catch (error) {
    console.error("getCartCount error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};