import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';
import sql from 'mssql';

async function runQueries() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB');

    // Count total orders
    const orderCountRes = await pool.request().query('SELECT COUNT(*) as total FROM [Order]');
    console.log('Total Orders in [Order] Table:', orderCountRes.recordset[0].total);

    // Count paid and active orders
    const paidActiveRes = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM [Order] 
      WHERE PaymentStatus = 1 AND OrderStatus NOT IN ('cancelled', 'failed')
    `);
    console.log('Paid & Non-cancelled/Non-failed Orders:', paidActiveRes.recordset[0].count);

    // Print all orders
    const ordersRes = await pool.request().query(`
      SELECT OrderID, UserID, TotalItems, TotalAmount, OrderStatus, PaymentStatus, CreatedAt
      FROM [Order]
      ORDER BY CreatedAt DESC
    `);
    console.log('--- Order list ---');
    ordersRes.recordset.forEach(o => {
      console.log(`OrderID: ${o.OrderID}, UserID: ${o.UserID}, TotalItems: ${o.TotalItems}, TotalAmount: ${o.TotalAmount}, Status: ${o.OrderStatus}, Paid: ${o.PaymentStatus}, CreatedAt: ${o.CreatedAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error running queries:', err);
    process.exit(1);
  }
}

runQueries();
