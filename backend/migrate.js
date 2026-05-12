import dotenv from 'dotenv';
dotenv.config();
import { connectDB, sql } from './config/database.js';

async function alterSchema() {
  try {
    const pool = await connectDB();
    
    // 1. Update Order status check constraint to support all statuses
    try {
      await pool.request().query(`ALTER TABLE dbo.[Order] DROP CONSTRAINT CK_Order_Status`);
      console.log('Dropped old CK_Order_Status');
    } catch(e) { console.log('CK_Order_Status not found or already dropped'); }
    
    await pool.request().query(`
      ALTER TABLE dbo.[Order] ADD CONSTRAINT CK_Order_Status 
      CHECK (OrderStatus IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled'))
    `);
    console.log('Added new CK_Order_Status with all statuses');

    // 2. Add BrandID and CategoryID columns to Product if they don't exist (for JOINs in productModel)
    // Check if Brand/Category tables exist  
    const brandExists = await pool.request().query(`SELECT OBJECT_ID('dbo.Brand', 'U') as id`);
    if (!brandExists.recordset[0].id) {
      await pool.request().query(`
        CREATE TABLE dbo.Brand (
          BrandID INT IDENTITY(1,1) PRIMARY KEY,
          BrandName NVARCHAR(100) NOT NULL UNIQUE,
          LogoURL NVARCHAR(MAX) NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
        )
      `);
      console.log('Created Brand table');
    }
    
    const catExists = await pool.request().query(`SELECT OBJECT_ID('dbo.Category', 'U') as id`);
    if (!catExists.recordset[0].id) {
      await pool.request().query(`
        CREATE TABLE dbo.Category (
          CategoryID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryName NVARCHAR(100) NOT NULL UNIQUE,
          ParentCategoryID INT NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
          CONSTRAINT FK_Category_Parent FOREIGN KEY (ParentCategoryID) REFERENCES dbo.Category(CategoryID)
        )
      `);
      console.log('Created Category table');
    }

    // Populate Brand table from existing Product.Brand column
    await pool.request().query(`
      INSERT INTO dbo.Brand (BrandName)
      SELECT DISTINCT Brand FROM dbo.Product 
      WHERE Brand IS NOT NULL AND Brand != ''
      AND Brand NOT IN (SELECT BrandName FROM dbo.Brand)
    `);
    console.log('Populated Brand table from Product data');

    // Populate Category table from existing Product.Category column
    await pool.request().query(`
      INSERT INTO dbo.Category (CategoryName)
      SELECT DISTINCT Category FROM dbo.Product 
      WHERE Category IS NOT NULL AND Category != ''
      AND Category NOT IN (SELECT CategoryName FROM dbo.Category)
    `);
    console.log('Populated Category table from Product data');

    // Add BrandID and CategoryID FK columns to Product if missing
    const cols = await pool.request().query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Product' AND COLUMN_NAME IN ('BrandID', 'CategoryID')
    `);
    const existingCols = cols.recordset.map(r => r.COLUMN_NAME);

    if (!existingCols.includes('BrandID')) {
      await pool.request().query(`ALTER TABLE dbo.Product ADD BrandID INT NULL`);
      await pool.request().query(`
        UPDATE p SET p.BrandID = b.BrandID 
        FROM dbo.Product p JOIN dbo.Brand b ON p.Brand = b.BrandName
      `);
      console.log('Added BrandID to Product');
    }
    if (!existingCols.includes('CategoryID')) {
      await pool.request().query(`ALTER TABLE dbo.Product ADD CategoryID INT NULL`);
      await pool.request().query(`
        UPDATE p SET p.CategoryID = c.CategoryID 
        FROM dbo.Product p JOIN dbo.Category c ON p.Category = c.CategoryName
      `);
      console.log('Added CategoryID to Product');
    }

    console.log('Schema migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

alterSchema();
