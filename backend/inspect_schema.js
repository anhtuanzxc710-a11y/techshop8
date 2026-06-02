import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';

async function inspect() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB');

    // 1. Check actual columns of [Order]
    const orderCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Order'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== [Order] columns ===');
    orderCols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}${c.CHARACTER_MAXIMUM_LENGTH ? '(' + c.CHARACTER_MAXIMUM_LENGTH + ')' : ''}) nullable=${c.IS_NULLABLE}`));

    // 2. Check actual columns of Product
    const prodCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Product'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== Product columns ===');
    prodCols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}${c.CHARACTER_MAXIMUM_LENGTH ? '(' + c.CHARACTER_MAXIMUM_LENGTH + ')' : ''}) nullable=${c.IS_NULLABLE}`));

    // 3. Check if Category table exists
    const catTables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('Category', 'Brand')
    `);
    console.log('\n=== Category/Brand tables ===');
    catTables.recordset.forEach(t => console.log(`  Table: ${t.TABLE_NAME}`));

    // 4. If Category table exists, show columns
    try {
      const catCols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Category' ORDER BY ORDINAL_POSITION
      `);
      console.log('\n=== Category columns ===');
      catCols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));
      
      const catData = await pool.request().query('SELECT TOP 5 * FROM Category');
      console.log('\n=== Category sample data ===');
      console.log(JSON.stringify(catData.recordset, null, 2));
    } catch (e) { console.log('No Category table:', e.message); }

    // 5. Check [User] columns
    const userCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'User' ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== [User] columns ===');
    userCols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}${c.CHARACTER_MAXIMUM_LENGTH ? '(' + c.CHARACTER_MAXIMUM_LENGTH + ')' : ''})`));

    // 6. Check PaymentMethod values in Order
    const pmRes = await pool.request().query(`SELECT DISTINCT PaymentMethod FROM [Order]`);
    console.log('\n=== Distinct PaymentMethod values ===');
    pmRes.recordset.forEach(r => console.log(`  "${r.PaymentMethod}"`));

    // 7. Check OrderStatus values in Order
    const osRes = await pool.request().query(`SELECT DISTINCT OrderStatus FROM [Order]`);
    console.log('\n=== Distinct OrderStatus values ===');
    osRes.recordset.forEach(r => console.log(`  "${r.OrderStatus}"`));

    // 8. Check if Product has CategoryID or Category column
    const prodCatCheck = await pool.request().query(`
      SELECT TOP 3 ProductID, ProductName, 
        CASE WHEN COL_LENGTH('Product', 'CategoryID') IS NOT NULL THEN 'has CategoryID' ELSE 'no CategoryID' END as hasCatID,
        CASE WHEN COL_LENGTH('Product', 'Category') IS NOT NULL THEN 'has Category' ELSE 'no Category' END as hasCatCol
      FROM Product
    `);
    console.log('\n=== Product category field check ===');
    console.log(JSON.stringify(prodCatCheck.recordset, null, 2));

    // 9. Check if Product has BrandID
    try {
      const brandCheck = await pool.request().query('SELECT TOP 3 ProductID, ProductName, BrandID, CategoryID FROM Product');
      console.log('\n=== Product with BrandID/CategoryID ===');
      console.log(JSON.stringify(brandCheck.recordset, null, 2));
    } catch (e) {
      console.log('\nProduct does NOT have BrandID/CategoryID columns. Checking Category column...');
      try {
        const catCheck = await pool.request().query('SELECT TOP 3 ProductID, ProductName, Category, Brand FROM Product');
        console.log(JSON.stringify(catCheck.recordset, null, 2));
      } catch (e2) { console.log('Error:', e2.message); }
    }

    // 10. Check OrderItem columns
    const oiCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OrderItem' ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== OrderItem columns ===');
    oiCols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspect();
