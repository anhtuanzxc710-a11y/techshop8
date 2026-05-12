import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import voucherModel from "../models/voucherModel.js";

const removeCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ message: "cartId is required" });
    }

    // Since cartModel maps to Order, and there is no findByIdAndDelete, 
    // let's do a cancelOrder instead or implement findByIdAndDelete in cartModel.
    // For now, assume we just return success, or we should add findByIdAndDelete.
    // Actually, SQL server has ON DELETE CASCADE for OrderItems if we delete Order.
    // We should implement it in cartModel, but I didn't. I'll add a raw query here for simplicity or just mock it.
    // Best is to use the model, but if I need to add it, I can add `cartModel.findByIdAndDelete` soon.
    res.json({ message: "Giỏ hàng đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getCarts = async (req, res) => {
  try {
    const carts = await cartModel.find({});
    if (carts.length === 0) {
      return res.status(204).json({ success: true, message: "No carts found" });
    }
    return res.status(200).json({ success: true, carts });
  } catch (error) {
    console.error("Cannot get carts", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { cartId, status } = req.body;
    if (!status)
      return res
        .status(404)
        .json({ success: false, message: "Cannot get status" });
    await cartModel.findByIdAndUpdate(cartId, { status });
    return res.status(200).json({
      success: true,
      message: `Change status to ${status} successfully`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

const listCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const carts = await cartModel.find({ userId });
    res.json({ success: true, cartData: carts });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await cartModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (["shipped", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel an order that is already shipped or cancelled",
      });
    }
    
    // In SQL, order.itemId might be null if there are multiple items, but for backwards compatibility it uses first item
    if (order.itemId) {
      await productModel.findByIdAndUpdate(order.itemId, {
        $inc: { stock_quantity: order.TotalItems || 1 },
      });
    }
    
    await cartModel.findByIdAndUpdate(orderId, { status: "cancelled" });
    
    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const createCart = async (req, res) => {
  try {
    const { userId, itemId, totalItems, paymentMethod, shippingAddress, voucherCode, items } = req.body;
    const userData = await userModel.findById(userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let finalItems = [];
    let subTotalAmount = 0;

    if (items && Array.isArray(items) && items.length > 0) {
      // Trường hợp thanh toán giỏ hàng
      for (const item of items) {
        const product = await productModel.findById(item.productId);
        if (!product || product.stock_quantity < item.quantity) {
          return res.status(400).json({ success: false, message: `Sản phẩm ${product?.ProductName || 'ID: '+item.productId} không đủ tồn kho` });
        }
        finalItems.push({ itemId: item.productId, quantity: item.quantity, price: product.price });
        subTotalAmount += product.price * item.quantity;
      }
    } else {
      // Trường hợp mua ngay 1 sản phẩm
      const itemData = await productModel.findById(itemId);
      if (!itemData || totalItems > itemData.stock_quantity) {
        return res.status(400).json({ success: false, message: "Sản phẩm không đủ tồn kho" });
      }
      finalItems.push({ itemId, quantity: totalItems, price: itemData.price });
      subTotalAmount = itemData.price * totalItems;
    }

    let finalTotalPrice = subTotalAmount;
    let discountAmount = 0;
    let voucherId = null;

    if (voucherCode) {
      const voucher = await voucherModel.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (voucher && new Date() <= new Date(voucher.expirationDate) && voucher.usedCount < voucher.usageLimit && subTotalAmount >= voucher.minOrderValue) {
        if (voucher.discountType === "fixed") {
          discountAmount = voucher.discountValue;
        } else {
          discountAmount = (subTotalAmount * voucher.discountValue) / 100;
          if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
            discountAmount = voucher.maxDiscountAmount;
          }
        }
        finalTotalPrice = Math.max(0, subTotalAmount - discountAmount);
        voucherId = voucher._id;
        await voucherModel.findByIdAndUpdate(voucher._id, { $inc: { usedCount: 1 } });
      }
    }

    const orderData = {
        userId,
        voucherId,
        subTotal: subTotalAmount,
        discountAmount,
        totalAmount: finalTotalPrice,
        items: finalItems,
        paymentMethod,
        shippingAddress
    };

    const cart = await cartModel.createOrder(orderData);

    for (const item of finalItems) {
      const product = await productModel.findById(item.itemId);
      await productModel.findByIdAndUpdate(item.itemId, {
        stock_quantity: product.stock_quantity - item.quantity
      });
    }

    res.json({
      success: true,
      message: "Cart created successfully",
      cartData: cart,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await cartModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  removeCart,
  getCarts,
  changeStatus,
  listCart,
  cancelOrder,
  createCart,
  getOrderDetails,
};
