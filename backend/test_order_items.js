import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';

async function runQueries() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB');

    const itemsRes = await pool.request().query(`
      SELECT oi.OrderID, oi.ProductID, oi.Quantity, oi.UnitPrice, oi.LineTotal, p.ProductName
      FROM OrderItem oi
      JOIN [Order] ord ON oi.OrderID = ord.OrderID
      JOIN Product p ON oi.ProductID = p.ProductID
      WHERE ord.PaymentStatus = 1 AND ord.OrderStatus NOT IN ('cancelled', 'failed')
      ORDER BY oi.Quantity DESC
    `);
    console.log('--- OrderItem list ---');
    itemsRes.recordset.forEach(i => {
      console.log(`OrderID: ${i.OrderID}, ProductID: ${i.ProductID}, ProductName: ${i.ProductName}, Qty: ${i.Quantity}, UnitPrice: ${i.UnitPrice}, LineTotal: ${i.LineTotal}`);
    });

    const totalQty = itemsRes.recordset.reduce((sum, item) => sum + item.Quantity, 0);
    console.log('Total items sold sum:', totalQty);

    process.exit(0);
  } catch (err) {
    console.error('Error running queries:', err);
    process.exit(1);
  }
}

runQueries();
