import voucherModel from "../models/voucherModel.js";

// Thêm Voucher mới (Admin)
const addVoucher = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const voucherData = {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderAmount,
      maxDiscountAmount,
      expirationDate: expiryDate,
      usageLimit,
    };

    await voucherModel.create(voucherData);
    res.json({ success: true, message: "Voucher added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Lấy danh sách Voucher (Admin/User)
const listVouchers = async (req, res) => {
  try {
    const vouchers = await voucherModel.find({});
    res.json({ success: true, vouchers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Xóa Voucher (Admin)
const removeVoucher = async (req, res) => {
  try {
    await voucherModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Voucher removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Kiểm tra Voucher hợp lệ (User Checkout)
const validateVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const voucher = await voucherModel.findOne({ code: code.toUpperCase(), isActive: true });

    if (!voucher) {
      return res.json({ success: false, message: "Voucher code is invalid or inactive" });
    }

    // Check expiry
    if (new Date() > new Date(voucher.expirationDate)) {
      return res.json({ success: false, message: "Voucher has expired" });
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.json({ success: false, message: "Voucher usage limit reached" });
    }

    // Kiểm tra xem người dùng đã sử dụng mã này chưa
    if (req.body.userId) {
        const alreadyUsed = await voucherModel.checkUserUsage(req.body.userId, voucher._id);
        if (alreadyUsed) {
            return res.json({ success: false, message: "Bạn đã sử dụng mã giảm giá này rồi" });
        }
    }

    // Check minimum order amount
    if (orderAmount < voucher.minOrderValue) {
      return res.json({ 
        success: false, 
        message: `Minimum order amount for this voucher is ${voucher.minOrderValue}đ` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === "fixed") {
      discount = voucher.discountValue;
    } else {
      discount = (orderAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    }

    res.json({ 
      success: true, 
      message: "Voucher applied successfully", 
      discount,
      voucherCode: voucher.code
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Cập nhật Voucher (Admin)
const updateVoucher = async (req, res) => {
  try {
    const { id, code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, isActive } = req.body;
    
    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue) updateData.discountValue = discountValue;
    if (minOrderAmount !== undefined) updateData.minOrderValue = minOrderAmount;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
    if (expiryDate) updateData.expirationDate = expiryDate;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (isActive !== undefined) updateData.isActive = isActive;

    await voucherModel.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "Voucher updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addVoucher, listVouchers, removeVoucher, validateVoucher, updateVoucher };
