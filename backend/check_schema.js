import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';

async function checkData() {
  try {
    const pool = await connectDB();
    
    const cats = await pool.request().query('SELECT * FROM dbo.Category ORDER BY CategoryName');
    console.log('=== Categories ===');
    cats.recordset.forEach(c => console.log(`  ${c.CategoryID}: ${c.CategoryName}`));

    const brands = await pool.request().query('SELECT * FROM dbo.Brand ORDER BY BrandName');
    console.log('=== Brands ===');
    brands.recordset.forEach(b => console.log(`  ${b.BrandID}: ${b.BrandName}`));

    // Check how products look with JOIN
    const products = await pool.request().query(`
      SELECT TOP 3 p.ProductID, p.ProductName, b.BrandName as Brand, c.CategoryName as Category
      FROM Product p
      LEFT JOIN Brand b ON p.BrandID = b.BrandID
      LEFT JOIN Category c ON p.CategoryID = c.CategoryID
    `);
    console.log('=== Products with JOINs ===');
    console.log(JSON.stringify(products.recordset, null, 2));

    // Count products
    const totalProducts = await pool.request().query('SELECT COUNT(*) as cnt FROM Product');
    console.log('Total products:', totalProducts.recordset[0].cnt);

    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkData();
