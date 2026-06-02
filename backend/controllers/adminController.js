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

const getRevenueStats = async (req, res) => {
    try {
        let { startDate, endDate, groupBy, orderStatus, paymentMethod, categoryId, compare } = req.query;
        if (!groupBy) groupBy = 'day';
        const enableCompare = compare === 'true';

        const pad = (n) => n.toString().padStart(2, '0');

        if (!startDate || !endDate) {
            const today = new Date();
            const past30Days = new Date();
            past30Days.setDate(today.getDate() - 30);
            startDate = `${past30Days.getFullYear()}-${pad(past30Days.getMonth() + 1)}-${pad(past30Days.getDate())}`;
            endDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.json({ success: false, message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" });
        }

        const formattedStart = `${startDate} 00:00:00.000`;
        const formattedEnd = `${endDate} 23:59:59.999`;

        // Build dynamic WHERE conditions for extra filters
        let extraOrderWhere = '';
        let extraOrderWhereForRevenue = '';
        const validStatuses = ['processing', 'shipped', 'cancelled', 'delivered'];
        const filterOrderStatus = (orderStatus && orderStatus !== 'all' && validStatuses.includes(orderStatus)) ? orderStatus : null;
        const filterPaymentMethod = (paymentMethod && paymentMethod !== 'all') ? paymentMethod : null;
        const filterCategoryId = (categoryId && categoryId !== 'all' && !isNaN(parseInt(categoryId))) ? parseInt(categoryId) : null;

        if (filterOrderStatus) {
            extraOrderWhere += ` AND ord.OrderStatus = @filterOrderStatus`;
            extraOrderWhereForRevenue += ` AND OrderStatus = @filterOrderStatus`;
        }
        if (filterPaymentMethod) {
            extraOrderWhere += ` AND ord.PaymentMethod = @filterPaymentMethod`;
            extraOrderWhereForRevenue += ` AND PaymentMethod = @filterPaymentMethod`;
        }

        let statsData;
        try {
            const pool = await connectDB();

            // Helper to add common params to a request
            const addCommonParams = (request) => {
                request.input('startDate', sql.DateTime, new Date(formattedStart));
                request.input('endDate', sql.DateTime, new Date(formattedEnd));
                if (filterOrderStatus) request.input('filterOrderStatus', sql.NVarChar, filterOrderStatus);
                if (filterPaymentMethod) request.input('filterPaymentMethod', sql.NVarChar, filterPaymentMethod);
                return request;
            };

            // ========== 1. Summary Stats ==========
            let summaryWhereExtra = extraOrderWhereForRevenue;
            // Category filter requires JOIN for summary
            let summaryQuery;
            if (filterCategoryId) {
                summaryQuery = `
                    SELECT 
                        SUM(ord.TotalAmount) as totalRevenue,
                        COUNT(DISTINCT ord.OrderID) as totalPaidOrders
                    FROM [Order] ord
                    JOIN OrderItem oi ON ord.OrderID = oi.OrderID
                    JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE ord.PaymentStatus = 1
                      AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      AND p.CategoryID = @filterCategoryId
                      ${summaryWhereExtra.replace(/\bOrderStatus\b/g, 'ord.OrderStatus').replace(/\bPaymentMethod\b/g, 'ord.PaymentMethod')}
                `;
            } else {
                summaryQuery = `
                    SELECT 
                        SUM(TotalAmount) as totalRevenue,
                        COUNT(OrderID) as totalPaidOrders
                    FROM [Order]
                    WHERE PaymentStatus = 1
                      AND OrderStatus NOT IN ('cancelled', 'failed')
                      AND CreatedAt >= @startDate AND CreatedAt <= @endDate
                      ${summaryWhereExtra}
                `;
            }
            const statsReq = addCommonParams(pool.request());
            if (filterCategoryId) statsReq.input('filterCategoryId', sql.Int, filterCategoryId);
            const statsResult = await statsReq.query(summaryQuery);

            const generalStats = statsResult.recordset[0] || {};
            const totalRevenue = generalStats.totalRevenue || 0;
            const totalPaidOrders = generalStats.totalPaidOrders || 0;
            const averageOrderValue = totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0;

            // ========== 2. Total Items Sold ==========
            let itemsQuery;
            if (filterCategoryId) {
                itemsQuery = `
                    SELECT SUM(oi.Quantity) as totalItemsSold
                    FROM OrderItem oi
                    JOIN [Order] ord ON oi.OrderID = ord.OrderID
                    JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE ord.PaymentStatus = 1
                      AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      AND p.CategoryID = @filterCategoryId
                      ${extraOrderWhere}
                `;
            } else {
                itemsQuery = `
                    SELECT SUM(oi.Quantity) as totalItemsSold
                    FROM OrderItem oi
                    JOIN [Order] ord ON oi.OrderID = ord.OrderID
                    WHERE ord.PaymentStatus = 1
                      AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      ${extraOrderWhere}
                `;
            }
            const itemsReq = addCommonParams(pool.request());
            if (filterCategoryId) itemsReq.input('filterCategoryId', sql.Int, filterCategoryId);
            const itemsSoldResult = await itemsReq.query(itemsQuery);
            const totalItemsSold = itemsSoldResult.recordset[0]?.totalItemsSold || 0;

            // ========== 3. Revenue Series ==========
            let dateExpr;
            if (groupBy === 'year') dateExpr = "CONVERT(VARCHAR(4), CreatedAt, 120)";
            else if (groupBy === 'month') dateExpr = "CONVERT(VARCHAR(7), CreatedAt, 120)";
            else dateExpr = "CONVERT(VARCHAR(10), CreatedAt, 120)";

            let seriesQuery;
            if (filterCategoryId) {
                seriesQuery = `
                    SELECT ${dateExpr} as [date], SUM(ord.TotalAmount) as revenue, COUNT(DISTINCT ord.OrderID) as orders
                    FROM [Order] ord
                    JOIN OrderItem oi ON ord.OrderID = oi.OrderID
                    JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      AND p.CategoryID = @filterCategoryId
                      ${extraOrderWhere}
                    GROUP BY ${dateExpr.replace(/CreatedAt/g, 'ord.CreatedAt')}
                    ORDER BY [date] ASC
                `;
                // Fix: dateExpr uses CreatedAt but we need ord.CreatedAt in context
                seriesQuery = seriesQuery.replace(/CONVERT\(VARCHAR\(\d+\), CreatedAt/g, (m) => m.replace('CreatedAt', 'ord.CreatedAt'));
            } else {
                seriesQuery = `
                    SELECT ${dateExpr} as [date], SUM(TotalAmount) as revenue, COUNT(OrderID) as orders
                    FROM [Order]
                    WHERE PaymentStatus = 1 AND OrderStatus NOT IN ('cancelled', 'failed')
                      AND CreatedAt >= @startDate AND CreatedAt <= @endDate
                      ${extraOrderWhereForRevenue}
                    GROUP BY ${dateExpr}
                    ORDER BY [date] ASC
                `;
            }
            const seriesReq = addCommonParams(pool.request());
            if (filterCategoryId) seriesReq.input('filterCategoryId', sql.Int, filterCategoryId);
            const seriesResult = await seriesReq.query(seriesQuery);
            const revenueSeries = seriesResult.recordset.map(item => ({
                date: item.date,
                revenue: item.revenue || 0,
                orders: item.orders || 0
            }));

            // ========== 4. Top Products ==========
            let topProductsQuery = `
                SELECT TOP 5
                    oi.ProductID as productId,
                    p.ProductName as productName,
                    c.CategoryName as categoryName,
                    SUM(oi.Quantity) as totalSold,
                    SUM(oi.LineTotal) as revenue
                FROM OrderItem oi
                JOIN [Order] ord ON oi.OrderID = ord.OrderID
                JOIN Product p ON oi.ProductID = p.ProductID
                LEFT JOIN Category c ON p.CategoryID = c.CategoryID
                WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                  AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                  ${extraOrderWhere}
                  ${filterCategoryId ? ' AND p.CategoryID = @filterCategoryId' : ''}
                GROUP BY oi.ProductID, p.ProductName, c.CategoryName
                ORDER BY totalSold DESC
            `;
            const topProdReq = addCommonParams(pool.request());
            if (filterCategoryId) topProdReq.input('filterCategoryId', sql.Int, filterCategoryId);
            const topProductsResult = await topProdReq.query(topProductsQuery);
            const topProducts = topProductsResult.recordset;

            // ========== 5. Order Status Stats ==========
            const osReq = addCommonParams(pool.request());
            const orderStatusResult = await osReq.query(`
                SELECT
                    COUNT(OrderID) as totalOrders,
                    SUM(CASE WHEN OrderStatus = 'processing' THEN 1 ELSE 0 END) as unprocessedOrders,
                    SUM(CASE WHEN OrderStatus IN ('shipped', 'delivered', 'confirmed') THEN 1 ELSE 0 END) as processedOrders,
                    SUM(CASE WHEN OrderStatus IN ('cancelled', 'failed') THEN 1 ELSE 0 END) as cancelledOrders
                FROM [Order]
                WHERE CreatedAt >= @startDate AND CreatedAt <= @endDate
            `);
            const orderStatusStats = orderStatusResult.recordset[0] || {
                totalOrders: 0, unprocessedOrders: 0, processedOrders: 0, cancelledOrders: 0
            };

            // ========== 6. Category Revenue ==========
            const catRevReq = addCommonParams(pool.request());
            if (filterCategoryId) catRevReq.input('filterCategoryId', sql.Int, filterCategoryId);
            const categoryRevenueResult = await catRevReq.query(`
                SELECT
                    p.CategoryID as categoryId,
                    ISNULL(c.CategoryName, 'Không phân loại') as categoryName,
                    SUM(oi.LineTotal) as revenue,
                    SUM(oi.Quantity) as totalSold,
                    COUNT(DISTINCT ord.OrderID) as orderCount
                FROM OrderItem oi
                JOIN [Order] ord ON oi.OrderID = ord.OrderID
                JOIN Product p ON oi.ProductID = p.ProductID
                LEFT JOIN Category c ON p.CategoryID = c.CategoryID
                WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                  AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                  ${extraOrderWhere}
                  ${filterCategoryId ? ' AND p.CategoryID = @filterCategoryId' : ''}
                GROUP BY p.CategoryID, c.CategoryName
                ORDER BY revenue DESC
            `);
            const totalCatRevenue = categoryRevenueResult.recordset.reduce((s, r) => s + (r.revenue || 0), 0);
            const categoryRevenue = categoryRevenueResult.recordset.map(r => ({
                categoryId: r.categoryId,
                categoryName: r.categoryName,
                revenue: r.revenue || 0,
                totalSold: r.totalSold || 0,
                orderCount: r.orderCount || 0,
                percentOfRevenue: totalCatRevenue > 0 ? Math.round((r.revenue || 0) / totalCatRevenue * 10000) / 100 : 0
            }));

            // ========== 7. Payment Method Revenue ==========
            const pmRevReq = addCommonParams(pool.request());
            if (filterCategoryId) pmRevReq.input('filterCategoryId', sql.Int, filterCategoryId);
            let pmQuery;
            if (filterCategoryId) {
                pmQuery = `
                    SELECT
                        ord.PaymentMethod as paymentMethod,
                        SUM(ord.TotalAmount) as revenue,
                        COUNT(DISTINCT ord.OrderID) as orderCount
                    FROM [Order] ord
                    JOIN OrderItem oi ON ord.OrderID = oi.OrderID
                    JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      AND p.CategoryID = @filterCategoryId
                      ${extraOrderWhere}
                    GROUP BY ord.PaymentMethod
                    ORDER BY revenue DESC
                `;
            } else {
                pmQuery = `
                    SELECT
                        PaymentMethod as paymentMethod,
                        SUM(TotalAmount) as revenue,
                        COUNT(OrderID) as orderCount
                    FROM [Order]
                    WHERE PaymentStatus = 1 AND OrderStatus NOT IN ('cancelled', 'failed')
                      AND CreatedAt >= @startDate AND CreatedAt <= @endDate
                      ${extraOrderWhereForRevenue}
                    GROUP BY PaymentMethod
                    ORDER BY revenue DESC
                `;
            }
            const paymentMethodResult = await pmRevReq.query(pmQuery);
            const totalPmRevenue = paymentMethodResult.recordset.reduce((s, r) => s + (r.revenue || 0), 0);
            const paymentMethodRevenue = paymentMethodResult.recordset.map(r => ({
                paymentMethod: r.paymentMethod || 'Không xác định',
                revenue: r.revenue || 0,
                orderCount: r.orderCount || 0,
                percentOfRevenue: totalPmRevenue > 0 ? Math.round((r.revenue || 0) / totalPmRevenue * 10000) / 100 : 0
            }));

            // ========== 8. Top Customers ==========
            const tcReq = addCommonParams(pool.request());
            if (filterCategoryId) tcReq.input('filterCategoryId', sql.Int, filterCategoryId);
            let tcQuery;
            if (filterCategoryId) {
                tcQuery = `
                    SELECT TOP 10
                        u.UserID as customerId,
                        u.FullName as customerName,
                        u.Email as email,
                        u.Phone as phone,
                        SUM(ord.TotalAmount) as totalSpent,
                        COUNT(DISTINCT ord.OrderID) as paidOrders,
                        SUM(oi.Quantity) as totalItemsBought,
                        MAX(ord.CreatedAt) as lastOrderDate
                    FROM [Order] ord
                    JOIN [User] u ON ord.UserID = u.UserID
                    JOIN OrderItem oi ON ord.OrderID = oi.OrderID
                    JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      AND p.CategoryID = @filterCategoryId
                      ${extraOrderWhere}
                    GROUP BY u.UserID, u.FullName, u.Email, u.Phone
                    ORDER BY totalSpent DESC
                `;
            } else {
                tcQuery = `
                    SELECT TOP 10
                        u.UserID as customerId,
                        u.FullName as customerName,
                        u.Email as email,
                        u.Phone as phone,
                        SUM(ord.TotalAmount) as totalSpent,
                        COUNT(DISTINCT ord.OrderID) as paidOrders,
                        (SELECT SUM(oi2.Quantity) FROM OrderItem oi2 WHERE oi2.OrderID IN (
                            SELECT OrderID FROM [Order] WHERE UserID = u.UserID AND PaymentStatus = 1
                            AND OrderStatus NOT IN ('cancelled','failed')
                            AND CreatedAt >= @startDate AND CreatedAt <= @endDate
                        )) as totalItemsBought,
                        MAX(ord.CreatedAt) as lastOrderDate
                    FROM [Order] ord
                    JOIN [User] u ON ord.UserID = u.UserID
                    WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @startDate AND ord.CreatedAt <= @endDate
                      ${extraOrderWhere}
                    GROUP BY u.UserID, u.FullName, u.Email, u.Phone
                    ORDER BY totalSpent DESC
                `;
            }
            const topCustomersResult = await tcReq.query(tcQuery);
            const topCustomers = topCustomersResult.recordset.map(r => ({
                customerId: r.customerId,
                customerName: r.customerName || 'N/A',
                email: r.email || '',
                phone: r.phone || '',
                totalSpent: r.totalSpent || 0,
                paidOrders: r.paidOrders || 0,
                totalItemsBought: r.totalItemsBought || 0,
                lastOrderDate: r.lastOrderDate || null
            }));

            // ========== 9. Period Comparison ==========
            let comparison = null;
            if (enableCompare) {
                const currentStart = new Date(startDate);
                const currentEnd = new Date(endDate);
                const periodLengthMs = currentEnd.getTime() - currentStart.getTime();
                const periodLengthDays = Math.ceil(periodLengthMs / (1000 * 60 * 60 * 24)) + 1;
                const prevEnd = new Date(currentStart);
                prevEnd.setDate(prevEnd.getDate() - 1);
                const prevStart = new Date(prevEnd);
                prevStart.setDate(prevStart.getDate() - periodLengthDays + 1);

                const prevStartStr = `${prevStart.getFullYear()}-${pad(prevStart.getMonth() + 1)}-${pad(prevStart.getDate())} 00:00:00.000`;
                const prevEndStr = `${prevEnd.getFullYear()}-${pad(prevEnd.getMonth() + 1)}-${pad(prevEnd.getDate())} 23:59:59.999`;

                const prevReq = pool.request();
                prevReq.input('prevStart', sql.DateTime, new Date(prevStartStr));
                prevReq.input('prevEnd', sql.DateTime, new Date(prevEndStr));

                const prevStatsResult = await prevReq.query(`
                    SELECT
                        SUM(TotalAmount) as totalRevenue,
                        COUNT(OrderID) as totalPaidOrders
                    FROM [Order]
                    WHERE PaymentStatus = 1 AND OrderStatus NOT IN ('cancelled', 'failed')
                      AND CreatedAt >= @prevStart AND CreatedAt <= @prevEnd
                `);
                const prevItemsReq = pool.request();
                prevItemsReq.input('prevStart', sql.DateTime, new Date(prevStartStr));
                prevItemsReq.input('prevEnd', sql.DateTime, new Date(prevEndStr));
                const prevItemsResult = await prevItemsReq.query(`
                    SELECT SUM(oi.Quantity) as totalItemsSold
                    FROM OrderItem oi
                    JOIN [Order] ord ON oi.OrderID = ord.OrderID
                    WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
                      AND ord.CreatedAt >= @prevStart AND ord.CreatedAt <= @prevEnd
                `);

                const prev = prevStatsResult.recordset[0] || {};
                const prevRevenue = prev.totalRevenue || 0;
                const prevOrders = prev.totalPaidOrders || 0;
                const prevAOV = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;
                const prevItems = prevItemsResult.recordset[0]?.totalItemsSold || 0;

                const calcChange = (current, previous) => {
                    const change = current - previous;
                    let changePercent = null;
                    if (previous > 0) {
                        changePercent = Math.round((change / previous) * 10000) / 100;
                    } else if (current > 0) {
                        changePercent = null; // Cannot compute %, UI shows "Kỳ trước không có dữ liệu"
                    }
                    return { change, changePercent };
                };

                const prevStartFormatted = `${prevStart.getFullYear()}-${pad(prevStart.getMonth() + 1)}-${pad(prevStart.getDate())}`;
                const prevEndFormatted = `${prevEnd.getFullYear()}-${pad(prevEnd.getMonth() + 1)}-${pad(prevEnd.getDate())}`;

                comparison = {
                    enabled: true,
                    currentPeriod: {
                        startDate, endDate,
                        totalRevenue, totalPaidOrders, averageOrderValue, totalItemsSold
                    },
                    previousPeriod: {
                        startDate: prevStartFormatted,
                        endDate: prevEndFormatted,
                        totalRevenue: prevRevenue,
                        totalPaidOrders: prevOrders,
                        averageOrderValue: prevAOV,
                        totalItemsSold: prevItems
                    },
                    changes: {
                        ...calcChange(totalRevenue, prevRevenue),
                        revenueChange: totalRevenue - prevRevenue,
                        revenueChangePercent: calcChange(totalRevenue, prevRevenue).changePercent,
                        paidOrdersChange: totalPaidOrders - prevOrders,
                        paidOrdersChangePercent: calcChange(totalPaidOrders, prevOrders).changePercent,
                        averageOrderValueChange: averageOrderValue - prevAOV,
                        averageOrderValueChangePercent: calcChange(averageOrderValue, prevAOV).changePercent,
                        itemsSoldChange: totalItemsSold - prevItems,
                        itemsSoldChangePercent: calcChange(totalItemsSold, prevItems).changePercent
                    }
                };
            }

            statsData = {
                filters: {
                    startDate, endDate, groupBy,
                    orderStatus: filterOrderStatus || 'all',
                    paymentMethod: filterPaymentMethod || 'all',
                    categoryId: filterCategoryId || 'all'
                },
                summary: { totalRevenue, totalPaidOrders, averageOrderValue, totalItemsSold },
                comparison,
                revenueSeries,
                categoryRevenue,
                paymentMethodRevenue,
                topCustomers,
                topProducts,
                orderStatusStats: {
                    totalOrders: orderStatusStats.totalOrders || 0,
                    unprocessedOrders: orderStatusStats.unprocessedOrders || 0,
                    processedOrders: orderStatusStats.processedOrders || 0,
                    cancelledOrders: orderStatusStats.cancelledOrders || 0
                }
            };

        } catch (dbError) {
            console.log("Database connection issue inside getRevenueStats:", dbError.message);

            if (process.env.NODE_ENV === 'production') {
                return res.json({
                    success: false,
                    message: "Không thể kết nối cơ sở dữ liệu để lấy thống kê doanh thu. Vui lòng thử lại sau.",
                    stats: null
                });
            }

            console.log("NODE_ENV is not production, returning mock data for development.");
            const revenueSeries = [];
            let totalRevenue = 0;
            let totalPaidOrders = 0;
            let totalItemsSold = 0;

            if (groupBy === 'year') {
                const startYear = new Date(startDate).getFullYear();
                const endYear = new Date(endDate).getFullYear();
                for (let y = startYear; y <= endYear; y++) {
                    const rev = Math.floor(Math.random() * 20000000) + 15000000;
                    revenueSeries.push({ date: String(y), revenue: rev, orders: Math.floor(Math.random() * 50) + 30 });
                    totalRevenue += rev;
                    totalPaidOrders += revenueSeries[revenueSeries.length - 1].orders;
                    totalItemsSold += Math.floor(Math.random() * 150) + 50;
                }
            } else if (groupBy === 'month') {
                let current = new Date(startDate);
                const last = new Date(endDate);
                while (current <= last) {
                    const monthStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}`;
                    const rev = Math.floor(Math.random() * 8000000) + 5000000;
                    const ord = Math.floor(Math.random() * 20) + 10;
                    revenueSeries.push({ date: monthStr, revenue: rev, orders: ord });
                    totalRevenue += rev;
                    totalPaidOrders += ord;
                    totalItemsSold += Math.floor(Math.random() * 50) + 20;
                    current.setMonth(current.getMonth() + 1);
                }
            } else {
                let current = new Date(startDate);
                const last = new Date(endDate);
                let count = 0;
                while (current <= last && count < 35) {
                    const dayStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
                    const rev = Math.floor(Math.random() * 2000000) + 500000;
                    const ord = Math.floor(Math.random() * 5) + 1;
                    revenueSeries.push({ date: dayStr, revenue: rev, orders: ord });
                    totalRevenue += rev;
                    totalPaidOrders += ord;
                    totalItemsSold += Math.floor(Math.random() * 10) + 2;
                    current.setDate(current.getDate() + 1);
                    count++;
                }
            }

            const averageOrderValue = totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0;

            statsData = {
                filters: { startDate, endDate, groupBy, orderStatus: 'all', paymentMethod: 'all', categoryId: 'all' },
                summary: { totalRevenue, totalPaidOrders, averageOrderValue, totalItemsSold },
                comparison: enableCompare ? {
                    enabled: true,
                    currentPeriod: { startDate, endDate, totalRevenue, totalPaidOrders, averageOrderValue, totalItemsSold },
                    previousPeriod: { startDate: 'N/A', endDate: 'N/A', totalRevenue: 0, totalPaidOrders: 0, averageOrderValue: 0, totalItemsSold: 0 },
                    changes: { revenueChange: totalRevenue, revenueChangePercent: null, paidOrdersChange: totalPaidOrders, paidOrdersChangePercent: null, averageOrderValueChange: averageOrderValue, averageOrderValueChangePercent: null, itemsSoldChange: totalItemsSold, itemsSoldChangePercent: null }
                } : null,
                revenueSeries,
                categoryRevenue: [
                    { categoryId: 1, categoryName: "Smartphone (Mock)", revenue: Math.round(totalRevenue * 0.4), totalSold: 20, orderCount: 8, percentOfRevenue: 40 },
                    { categoryId: 2, categoryName: "Laptop (Mock)", revenue: Math.round(totalRevenue * 0.3), totalSold: 10, orderCount: 5, percentOfRevenue: 30 },
                    { categoryId: 3, categoryName: "Tai nghe (Mock)", revenue: Math.round(totalRevenue * 0.2), totalSold: 15, orderCount: 6, percentOfRevenue: 20 },
                    { categoryId: 4, categoryName: "Loa (Mock)", revenue: Math.round(totalRevenue * 0.1), totalSold: 5, orderCount: 3, percentOfRevenue: 10 }
                ],
                paymentMethodRevenue: [
                    { paymentMethod: "Cash (Mock)", revenue: Math.round(totalRevenue * 0.6), orderCount: 8, percentOfRevenue: 60 },
                    { paymentMethod: "ZaloPay (Mock)", revenue: Math.round(totalRevenue * 0.4), orderCount: 4, percentOfRevenue: 40 }
                ],
                topCustomers: [
                    { customerId: 1, customerName: "Nguyễn Văn A (Mock)", email: "a@mock.com", phone: "0901234567", totalSpent: Math.round(totalRevenue * 0.3), paidOrders: 5, totalItemsBought: 12, lastOrderDate: new Date().toISOString() }
                ],
                topProducts: [
                    { productId: 1, productName: "iPhone 15 Pro Max (Mock)", categoryName: "Smartphone", totalSold: 45, revenue: Math.round(totalRevenue * 0.25) },
                    { productId: 2, productName: "MacBook Air M2 (Mock)", categoryName: "Laptop", totalSold: 32, revenue: Math.round(totalRevenue * 0.2) }
                ],
                orderStatusStats: { totalOrders: totalPaidOrders + 15, unprocessedOrders: 10, processedOrders: totalPaidOrders, cancelledOrders: 5 },
                isMockData: true
            };
        }

        // Backward compat: also put summary fields at top level for existing Dashboard cards
        const responseStats = {
            ...statsData,
            totalRevenue: statsData.summary?.totalRevenue ?? statsData.totalRevenue ?? 0,
            totalPaidOrders: statsData.summary?.totalPaidOrders ?? statsData.totalPaidOrders ?? 0,
            averageOrderValue: statsData.summary?.averageOrderValue ?? statsData.averageOrderValue ?? 0,
            totalItemsSold: statsData.summary?.totalItemsSold ?? statsData.totalItemsSold ?? 0,
        };

        res.json({
            success: true,
            stats: responseStats,
            isMockData: statsData?.isMockData || false,
            message: statsData?.isMockData ? "Đang hiển thị dữ liệu mẫu do chưa kết nối được database" : undefined
        });

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
    getUserOrders,
    getRevenueStats
}