import { sql, connectDB } from "../config/database.js";

const shoppingCartModel = {
  async getCartByUser(userId) {
    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT sc.CartItemID, sc.ProductID, sc.Quantity, sc.CreatedAt,
               p.ProductName, p.Price, p.ImageURL, p.StockQuantity, p.IsAvailable,
               b.BrandName, c.CategoryName
        FROM ShoppingCart sc
        JOIN Product p ON sc.ProductID = p.ProductID
        LEFT JOIN Brand b ON p.BrandID = b.BrandID
        LEFT JOIN Category c ON p.CategoryID = c.CategoryID
        WHERE sc.UserID = @UserID
        ORDER BY sc.CreatedAt DESC
      `);
    return result.recordset.map(row => ({
      _id: row.CartItemID,
      productId: row.ProductID,
      quantity: row.Quantity,
      createdAt: row.CreatedAt,
      product: {
        _id: row.ProductID,
        name: row.ProductName,
        price: row.Price,
        image_url: row.ImageURL,
        stock_quantity: row.StockQuantity,
        available: row.IsAvailable,
        brand: row.BrandName,
        category: row.CategoryName
      }
    }));
  },

  async addItem(userId, productId, quantity = 1) {
    const pool = await connectDB();
    // Upsert: if item exists, increase quantity; otherwise insert
    const existing = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .query('SELECT CartItemID, Quantity FROM ShoppingCart WHERE UserID = @UserID AND ProductID = @ProductID');

    if (existing.recordset.length > 0) {
      const newQty = existing.recordset[0].Quantity + quantity;
      await pool.request()
        .input('CartItemID', sql.Int, existing.recordset[0].CartItemID)
        .input('Quantity', sql.Int, newQty)
        .query('UPDATE ShoppingCart SET Quantity = @Quantity, UpdatedAt = SYSDATETIME() WHERE CartItemID = @CartItemID');
    } else {
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('ProductID', sql.Int, productId)
        .input('Quantity', sql.Int, quantity)
        .query('INSERT INTO ShoppingCart (UserID, ProductID, Quantity) VALUES (@UserID, @ProductID, @Quantity)');
    }
    return await this.getCartByUser(userId);
  },

  async updateQuantity(userId, productId, quantity) {
    const pool = await connectDB();
    if (quantity <= 0) {
      return await this.removeItem(userId, productId);
    }
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .query('UPDATE ShoppingCart SET Quantity = @Quantity, UpdatedAt = SYSDATETIME() WHERE UserID = @UserID AND ProductID = @ProductID');
    return await this.getCartByUser(userId);
  },

  async removeItem(userId, productId) {
    const pool = await connectDB();
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .query('DELETE FROM ShoppingCart WHERE UserID = @UserID AND ProductID = @ProductID');
    return await this.getCartByUser(userId);
  },

  async clearCart(userId) {
    const pool = await connectDB();
    await pool.request()
      .input('UserID', sql.Int, userId)
      .query('DELETE FROM ShoppingCart WHERE UserID = @UserID');
  },

  async getItemCount(userId) {
    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query('SELECT ISNULL(SUM(Quantity), 0) as totalItems FROM ShoppingCart WHERE UserID = @UserID');
    return result.recordset[0].totalItems;
  }
};

export default shoppingCartModel;
