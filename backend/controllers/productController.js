import productModel from "../models/productModel.js";
import cartModel from "../models/cartModel.js";
import { v2 as cloudinary } from "cloudinary";

const detailProduct = async (req, res) => {
  try {
    const { prId } = req.params;
    const product = await productModel.findById(prId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot find product" });
  }
};
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy thông tin đơn hàng
    const order = await cartModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "cancelled"].includes(order.status)) {
      return res
        .status(400)
        .json({
          message:
            "Cannot cancel an order that is already shipped or cancelled",
        });
    }

    const product = await productModel.findById(order.itemId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [updatedOrder, _] = await Promise.all([
      cartModel.findByIdAndUpdate(
        orderId,
        { status: "cancelled" },
        { new: true }
      ),
      productModel.findByIdAndUpdate(order.itemId, {
        $inc: { stock_quantity: order.totalItems },
      }),
    ]);

    return res
      .status(200)
      .json({ message: "Order cancelled successfully", updatedOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const changeBestsellerStatus = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: "Fail to find product" });

    // Tìm sản phẩm trước để lấy giá trị bestseller hiện tại
    const product = await productModel.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Đảo ngược trạng thái bestseller
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { bestseller: !product.bestseller },
      { new: true } // Trả về bản ghi mới sau khi cập nhật
    );

    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Fail to change bestseller status" });
  }
};
const updateProduct = async (req, res) => {
  try {
    const {
      productId,
      price,
      stock_quantity,
      name,
      category,
      brand,
      description,
      existingImages
    } = req.body;
    
    const specs = req.body.specifications ? JSON.parse(req.body.specifications) : {};
    const files = req.files;
    
    const mainImageFile = files && files.image ? files.image[0] : null;
    const additionalImageFiles = files && files.images ? files.images : [];

    let imageURL = req.body.image_url;

    if (mainImageFile) {
      const imageUpload = await cloudinary.uploader.upload(mainImageFile.path, {
        resource_type: "image",
      });
      imageURL = imageUpload.secure_url;
    }

    // Handle additional images
    let finalImages = [];
    if (existingImages) {
        finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    if (additionalImageFiles.length > 0) {
        for (const file of additionalImageFiles) {
            const upload = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
            finalImages.push(upload.secure_url);
        }
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        price,
        stock_quantity,
        name,
        category,
        brand,
        description,
        image_url: imageURL,
        images: finalImages,
        specifications: specs,
      }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data: updatedProduct });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const deleteProduct = async (req,res) =>{
  try {
    const prid=req.body.prid
    await productModel.findByIdAndDelete(prid);
    return res.status(204).json({success:true,message:"Delete product successfully !"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({success:false,message:"Server Error !"})
  }
}
const getProducts = async (req, res) => {
  try {
    const { query, category, brand, minPrice, maxPrice } = req.query;
    
    const filter = {
      search: query,
      category: category ? (Array.isArray(category) ? category : [category]) : [],
      brand: brand ? (Array.isArray(brand) ? brand : [brand]) : [],
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null
    };

    const products = await productModel.find(filter);
    return res.json({ success: true, products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export {
  detailProduct,
  cancelOrder,
  changeBestsellerStatus,
  updateProduct,
  getProducts,
  deleteProduct
};
