import { sql, connectDB } from "../config/database.js";

const cartModel = {
    // Uses the stored procedure sp_CreateOrder
    async createOrder(data) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            
            // 1. Call Stored Procedure
            const result = await request
                .input('UserID', sql.Int, data.userId)
                .input('VoucherID', sql.Int, data.voucherId || null)
                .input('SubTotalAmount', sql.Decimal(18,2), data.subTotal)
                .input('DiscountAmount', sql.Decimal(18,2), data.discountAmount || 0)
                .input('TotalAmount', sql.Decimal(18,2), data.totalAmount)
                .input('TotalItems', sql.Int, data.items ? data.items.length : 1)
                .input('PaymentMethod', sql.NVarChar, data.paymentMethod || 'Cash')
                .input('ShippingAddress', sql.NVarChar, data.shippingAddress)
                .execute('sp_CreateOrder');

            const orderId = result.recordset[0].NewOrderID;

            // 2. Insert Order Items
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    const itemReq = new sql.Request(transaction);
                    await itemReq
                        .input('OrderID', sql.Int, orderId)
                        .input('ProductID', sql.Int, item.itemId)
                        .input('Quantity', sql.Int, item.quantity || 1)
                        .input('UnitPrice', sql.Decimal(18,2), item.price)
                        .query(`
                            INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice)
                            VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
                        `);
                }
            } else if (data.itemId) {
                 // Fallback for older code that sends single item in root
                 const itemReq = new sql.Request(transaction);
                 await itemReq
                     .input('OrderID', sql.Int, orderId)
                     .input('ProductID', sql.Int, data.itemId)
                     .input('Quantity', sql.Int, data.totalItems || 1)
                     .input('UnitPrice', sql.Decimal(18,2), data.totalAmount)
                     .query(`
                         INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice)
                         VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
                     `);
            }

            await transaction.commit();
            return await this.findById(orderId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async findById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('OrderID', sql.Int, id)
            .query(`
                SELECT o.*, v.VoucherCode, v.DiscountValue, v.DiscountType 
                FROM [Order] o
                LEFT JOIN Voucher v ON o.VoucherID = v.VoucherID
                WHERE o.OrderID = @OrderID
            `);
        
        const order = result.recordset[0];
        if (order) {
            const itemsRes = await pool.request()
                .input('OrderID', sql.Int, id)
                .query(`
                    SELECT oi.*, p.ProductName, p.ImageURL 
                    FROM OrderItem oi 
                    JOIN Product p ON oi.ProductID = p.ProductID 
                    WHERE oi.OrderID = @OrderID
                `);
            order.items = itemsRes.recordset;
            // Backwards compatibility
            order.userId = order.UserID;
            if (order.items.length > 0) {
                order.itemId = order.items[0].ProductID;
                order.status = order.OrderStatus;
            }
        }
        return order;
    },

    async find(filter = {}) {
        const pool = await connectDB();
        let query = 'SELECT * FROM [Order] WHERE 1=1';
        const request = pool.request();

        if (filter.userId) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }

        query += ' ORDER BY CreatedAt DESC';

        const result = await request.query(query);
        const orders = result.recordset;

        // Fetch items for each order and map to frontend format
        for (let order of orders) {
             const itemsRes = await pool.request()
                .input('OrderID', sql.Int, order.OrderID)
                .query('SELECT o.*, p.ProductName, p.ImageURL FROM OrderItem o JOIN Product p ON o.ProductID = p.ProductID WHERE o.OrderID = @OrderID');
             
             order._id = order.OrderID;
             order.userId = order.UserID;
             order.status = order.OrderStatus;
             order.totalPrice = order.TotalAmount; // Frontend expects totalPrice
             order.totalItems = order.TotalItems;
             order.paymentStatus = order.PaymentStatus;
             order.deliveryDate = order.DeliveryDate || order.CreatedAt;
             
             // The frontend expects itemData (single item view)
             if (itemsRes.recordset.length > 0) {
                 const firstItem = itemsRes.recordset[0];
                 order.itemData = {
                     _id: firstItem.ProductID,
                     name: firstItem.ProductName,
                     image_url: firstItem.ImageURL,
                     price: firstItem.UnitPrice
                 };
             }
        }

        return orders;
    },

    async findByIdAndUpdate(id, data, options = {}) {
        const pool = await connectDB();
        const request = pool.request().input('OrderID', sql.Int, id);
        let updates = [];

        if (data.status) {
            updates.push('OrderStatus = @OrderStatus');
            request.input('OrderStatus', sql.NVarChar, data.status);
            if (data.status === 'delivered' && data.payment === undefined) {
                updates.push('PaymentStatus = 1');
            }
        }
        if (data.payment) {
            updates.push('PaymentStatus = @PaymentStatus');
            request.input('PaymentStatus', sql.Bit, data.payment ? 1 : 0);
        }

        if (updates.length > 0) {
            await request.query(`UPDATE [Order] SET ${updates.join(', ')} WHERE OrderID = @OrderID`);
        }

        return await this.findById(id);
    },

<<<<<<< Updated upstream
    async findByIdAndDelete(id) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            request.input('OrderID', sql.Int, id);
            await request.query('DELETE FROM OrderItem WHERE OrderID = @OrderID');
            await request.query('DELETE FROM [Order] WHERE OrderID = @OrderID');
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
=======
    async deleteById(id) {
        const pool = await connectDB();
        await pool.request()
            .input('OrderID', sql.Int, id)
            .query('DELETE FROM [Order] WHERE OrderID = @OrderID');
        return true;
>>>>>>> Stashed changes
    }
};

export default cartModel;
