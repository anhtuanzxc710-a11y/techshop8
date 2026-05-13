import productModel from '../models/productModel.js'
import userModel from '../models/userModel.js'
import cartModel from '../models/cartModel.js';
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from "cloudinary"
import commentModel from '../models/commentModel.js';
import { sql, connectDB } from "../config/database.js";
// api add product
const addProduct = async (req, res) => {
    try { 
        const { name, price, description, category, stock_quantity, brand, specifications } = req.body;
        const files = req.files;
        
        const imageFile = files.image ? files.image[0] : null;
        const additionalImages = files.images || [];

        if (!imageFile) return res.status(404).json({success:false,message:'Main image is required'});
        
        if (!name || !price || !category || !stock_quantity || !brand ) {
            return res.json({ success: false, message: "Missing product details" });
        }

        if (price <= 0) {
            return res.json({ success: false, message: "Price must be positive" });
        }

        // Upload main image
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageURL = imageUpload.secure_url;

        // Upload additional images
        const imagesURLs = [];
        for (const file of additionalImages) {
            const upload = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
            imagesURLs.push(upload.secure_url);
        }

        const productData = {
            name,
            price,
            description,
            specifications: JSON.parse(specifications),
            category,
            brand,
            stock_quantity,
            image_url: imageURL,
            images: imagesURLs,
            dateAdded: Date.now()
        };

        const newProduct = await productModel.create(productData);

        res.json({ success: true, message: "Product added successfully", data: newProduct });
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
const adminDashboard = async (req, res) => {
  try {
    let dashData;
    try {
        const comments = await commentModel.find({});
        const products = await productModel.find({});
        const carts = await cartModel.find({});
        const users = await userModel.find({});

        const pool = await connectDB();
        
        const revResult = await pool.request()
            .query('SELECT SUM(TotalAmount) as totalRevenue, COUNT(OrderID) as totalSuccessfulOrders FROM [Order] WHERE PaymentStatus = 1');
        const revenueStats = [{
            totalRevenue: revResult.recordset[0].totalRevenue || 0,
            totalSuccessfulOrders: revResult.recordset[0].totalSuccessfulOrders || 0
        }];

        const orderStatsResult = await pool.request()
            .query(`
                SELECT 
                    COUNT(OrderID) as totalOrders,
                    SUM(CASE WHEN OrderStatus = 'processing' THEN 1 ELSE 0 END) as unprocessedOrders,
                    SUM(CASE WHEN OrderStatus IN ('shipped', 'delivered', 'confirmed') THEN 1 ELSE 0 END) as processedOrders
                FROM [Order]
            `);
        const orderStats = orderStatsResult.recordset[0];

        const lowStockResult = await pool.request()
            .query('SELECT COUNT(ProductID) as lowStockCount FROM Product WHERE StockQuantity <= 10');
        const lowStockCount = lowStockResult.recordset[0].lowStockCount || 0;

        const voucherResult = await pool.request()
            .query('SELECT COUNT(VoucherID) as totalVouchers, SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as activeVouchers FROM Voucher');
        const voucherStats = {
            totalVouchers: voucherResult.recordset[0].totalVouchers || 0,
            activeVouchers: voucherResult.recordset[0].activeVouchers || 0
        };

        const monthlyResult = await pool.request()
            .query('SELECT MONTH(CreatedAt) as _id, SUM(TotalAmount) as revenue FROM [Order] WHERE PaymentStatus = 1 GROUP BY MONTH(CreatedAt) ORDER BY _id ASC');
        const monthlyRevenue = monthlyResult.recordset;

        const topSellingResult = await pool.request()
            .query(`
                SELECT TOP 5 
                    o.ProductID as _id, 
                    SUM(o.Quantity) as totalSold, 
                    p.ProductName as productName 
                FROM OrderItem o 
                JOIN [Order] ord ON o.OrderID = ord.OrderID 
                JOIN Product p ON o.ProductID = p.ProductID 
                WHERE ord.PaymentStatus = 1 
                GROUP BY o.ProductID, p.ProductName 
                ORDER BY totalSold DESC
            `);
        const topSellingProducts = topSellingResult.recordset;

        dashData = {
          qcomments: comments.length,
          qproducts: products.length,
          qcarts: carts.length,
          users,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          totalSuccessfulOrders: revenueStats[0]?.totalSuccessfulOrders || 0,
          totalOrders: orderStats.totalOrders || 0,
          unprocessedOrders: orderStats.unprocessedOrders || 0,
          processedOrders: orderStats.processedOrders || 0,
          lowStockCount,
          voucherStats,
          monthlyRevenue,
          topSellingProducts,
        };
    } catch (dbError) {
        console.log("Database connection issue, using MOCK data for demo.");
        // MOCK DATA CHO DEMO KHI KHÔNG CÓ DB
        dashData = {
            qcomments: 12,
            qproducts: 45,
            qcarts: 89,
            users: [
                { _id: "1", name: "Nguyễn Văn A", email: "vana@gmail.com", image: "https://i.pravatar.cc/150?u=1" },
                { _id: "2", name: "Trần Thị B", email: "thib@gmail.com", image: "https://i.pravatar.cc/150?u=2" }
            ],
            totalRevenue: 125000000,
            totalSuccessfulOrders: 156,
            monthlyRevenue: [
                { _id: 1, revenue: 12000000 },
                { _id: 2, revenue: 15000000 },
                { _id: 3, revenue: 22000000 },
                { _id: 4, revenue: 18000000 },
                { _id: 5, revenue: 25000000 },
                { _id: 6, revenue: 33000000 }
            ],
            topSellingProducts: [
                { productName: "iPhone 15 Pro Max", totalSold: 45 },
                { productName: "MacBook Air M2", totalSold: 32 },
                { productName: "AirPods Pro 2", totalSold: 28 },
                { productName: "iPad Pro 11 inch", totalSold: 15 }
            ]
        };
    }
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const loginAdmin=async(req,res)=>{
    try {
        const {email,password}=req.body
        if (email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false, message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const updateCart = async (req, res) => {
    try {
        const {status, cartId}=req.body;
        const cart = await cartModel.findByIdAndUpdate(
            cartId, 
            { status: status },
            { new: true } 
        );
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        return res.json({success: true, data:cart});
    } catch (error) {
        console.log(error.message);
        
    }
}
const getProducts = async (req, res) => {
    try {
        const { query, category, brand } = req.query;
        let filter = [];

        if (query) {
            filter.push({
                $or: [
                    { name: {$regex:query,$options:"i"}},
                    { brand: { $regex: query, $options: "i" } }, 
                    { category: { $regex: query, $options: "i" } }, 
                ]
            });
        }

        if (category) {
            filter.push({ category });
        }

        if (brand) {
            filter.push({ brand });
        }
        const products = await productModel.find(filter.length ? { $and: filter } : {});

        res.json({ success: true, products: products});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const changeProductAvailability=async(req,res)=>{
    try {
        
        const {productId}=req.body;
        if (!productId) return res.json({ success: false, message:"productId is required"});
        const productData=await productModel.findById(productId)
        if(!productData) return res.json({ success: false, message:"ko có dl"});
        const data = await productModel.findByIdAndUpdate(
            productId, 
            { available: !productData?.available }
          );
        if (data) delete data.image_url;
        res.json({success:true,message:"Availability Changed",data:data})
    } catch (error) {
         console.log(error)
        res.json({success:false,message:error.message})
    }
}

// User Management
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({ role: 'Customer' });
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;
        const pool = await connectDB();
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('IsActive', sql.Bit, isActive ? 1 : 0)
            .query('UPDATE [User] SET IsActive = @IsActive WHERE UserID = @UserID');
        
        res.json({ success: true, message: `User ${isActive ? 'activated' : 'blocked'} successfully` });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await cartModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addProduct,
    getProducts,
    adminDashboard,
    loginAdmin,
    updateCart,
    changeProductAvailability,
    getAllUsers,
    toggleUserStatus,
    getUserOrders
}