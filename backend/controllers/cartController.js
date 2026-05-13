import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import voucherModel from "../models/voucherModel.js";
import { sql, connectDB } from "../config/database.js";

const removeCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ message: "cartId is required" });
    }

    await cartModel.findByIdAndDelete(cartId);
    res.json({ success: true, message: "Giỏ hàng đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
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

    const order = await cartModel.findById(cartId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const prevStatus = order.status;
    const isSubtractedState = (s) => ["shipped", "delivered"].includes(s);

    // If moving TO a subtracted state FROM a non-subtracted state -> Subtract
    if (isSubtractedState(status) && !isSubtractedState(prevStatus)) {
      for (const item of order.items) {
        const product = await productModel.findById(item.ProductID);
        if (product) {
          await productModel.findByIdAndUpdate(item.ProductID, {
            stock_quantity: Math.max(0, product.stock_quantity - item.Quantity)
          });
        }
      }
    } 
    // If moving FROM a subtracted state TO a non-subtracted state (e.g. cancelled) -> Return stock
    else if (!isSubtractedState(status) && isSubtractedState(prevStatus)) {
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.ProductID, {
          $inc: { stock_quantity: item.Quantity }
        });
      }
    }

    await cartModel.findByIdAndUpdate(cartId, { status });
    return res.status(200).json({
      success: true,
      message: `Change status to ${status} successfully`,
    });
  } catch (error) {
    console.error("Error in changeStatus:", error);
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

    // Return stock only if it was already subtracted (status was shipped or delivered)
    if (["shipped", "delivered"].includes(order.status)) {
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.ProductID, {
          $inc: { stock_quantity: item.Quantity },
        });
      }
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
          return res.status(400).json({ success: false, message: `Sản phẩm ${product?.ProductName || 'ID: ' + item.productId} không đủ tồn kho` });
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
        // Kiểm tra xem người dùng đã sử dụng mã này chưa
        const alreadyUsed = await voucherModel.checkUserUsage(userId, voucher._id);
        if (alreadyUsed) {
          return res.status(400).json({ success: false, message: "Bạn đã sử dụng mã giảm giá này cho một đơn hàng trước đó" });
        }

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
        // Bỏ việc tự increment ở đây vì Stored Procedure sp_CreateOrder sẽ tự thực hiện increment và ghi log UserVoucherUsage
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

    // Stock subtraction removed here. Now happens in changeStatus when admin ships/delivers.


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

const confirmOrderDelivered = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        const pool = await connectDB();
        
        const checkOrder = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .input('UserID', sql.Int, userId)
            .query("SELECT OrderStatus FROM [Order] WHERE OrderID = @OrderID AND UserID = @UserID");

        if (checkOrder.recordset.length === 0) {
            return res.json({ success: false, message: "Đơn hàng không tồn tại" });
        }

        if (checkOrder.recordset[0].OrderStatus !== 'shipped') {
            return res.json({ success: false, message: "Chỉ có thể xác nhận đơn hàng đang giao" });
        }

        await pool.request()
            .input('OrderID', sql.Int, orderId)
            .query("UPDATE [Order] SET OrderStatus = 'delivered', PaymentStatus = 1, UpdatedAt = SYSDATETIME() WHERE OrderID = @OrderID");

        res.json({ success: true, message: "Xác nhận nhận hàng thành công!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export {
  removeCart,
  getCarts,
  changeStatus,
  listCart,
  cancelOrder,
  createCart,
  getOrderDetails,
  confirmOrderDelivered
};
