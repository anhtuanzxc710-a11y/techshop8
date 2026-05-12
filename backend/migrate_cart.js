import dotenv from 'dotenv';
dotenv.config();
import { connectDB, sql } from './config/database.js';

async function migrateCart() {
  try {
    const pool = await connectDB();
    console.log('Creating ShoppingCart table...');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ShoppingCart')
      BEGIN
        CREATE TABLE ShoppingCart (
          CartItemID INT IDENTITY(1,1) PRIMARY KEY,
          UserID INT NOT NULL,
          ProductID INT NOT NULL,
          Quantity INT NOT NULL DEFAULT 1,
          CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
          UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
          CONSTRAINT FK_ShoppingCart_User FOREIGN KEY (UserID) REFERENCES [User](UserID) ON DELETE CASCADE,
          CONSTRAINT FK_ShoppingCart_Product FOREIGN KEY (ProductID) REFERENCES Product(ProductID) ON DELETE CASCADE,
          CONSTRAINT UQ_ShoppingCart_UserProduct UNIQUE (UserID, ProductID)
        );
        PRINT 'ShoppingCart table created.';
      END
      ELSE
        PRINT 'ShoppingCart table already exists.';
    `);

    // Also add Rating column to Comment table if not exists
    console.log('Ensuring Rating column in Comment table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comment' AND COLUMN_NAME = 'Rating')
      BEGIN
        ALTER TABLE Comment ADD Rating INT NULL;
        PRINT 'Rating column added to Comment.';
      END
      ELSE
        PRINT 'Rating column already exists.';
    `);

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrateCart();
