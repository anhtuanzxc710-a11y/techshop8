import dotenv from 'dotenv';
dotenv.config();
import { connectDB, sql } from './config/database.js';

async function seedVouchers() {
  try {
    const pool = await connectDB();
    console.log('Connected to SQL Server for seeding...');

    const vouchers = [
      {
        code: 'TECHSHOP10',
        description: 'Giảm 10% cho đơn hàng công nghệ từ 1.000.000đ',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000000,
        maxDiscountAmount: 500000,
        expiryDate: '2026-12-31',
        usageLimit: 100
      },
      {
        code: 'FREESHIP',
        description: 'Giảm 50.000đ phí vận chuyển',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        expiryDate: '2026-12-31',
        usageLimit: 500
      },
      {
        code: 'GIFT200K',
        description: 'Quà tặng 200.000đ cho đơn từ 2.000.000đ',
        discountType: 'fixed',
        discountValue: 200000,
        minOrderAmount: 2000000,
        maxDiscountAmount: null,
        expiryDate: '2026-12-31',
        usageLimit: 50
      }
    ];

    for (const v of vouchers) {
      // Check if exists
      const check = await pool.request()
        .input('Code', sql.NVarChar, v.code)
        .query('SELECT * FROM Voucher WHERE VoucherCode = @Code');

      if (check.recordset.length === 0) {
        await pool.request()
          .input('Code', sql.NVarChar, v.code)
          .input('Desc', sql.NVarChar, v.description)
          .input('Type', sql.NVarChar, v.discountType)
          .input('Val', sql.Decimal(18,2), v.discountValue)
          .input('Min', sql.Decimal(18,2), v.minOrderAmount)
          .input('Max', sql.Decimal(18,2), v.maxDiscountAmount)
          .input('Expiry', sql.DateTime2, new Date(v.expiryDate))
          .input('Limit', sql.Int, v.usageLimit)
          .query(`
            INSERT INTO Voucher (VoucherCode, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscountAmount, ExpiryDate, UsageLimit)
            VALUES (@Code, @Desc, @Type, @Val, @Min, @Max, @Expiry, @Limit)
          `);
        console.log(`Created voucher: ${v.code}`);
      } else {
        console.log(`Voucher ${v.code} already exists.`);
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedVouchers();
