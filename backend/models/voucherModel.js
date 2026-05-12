import { sql, connectDB } from "../config/database.js";

const voucherModel = {
    async findOne(filter) {
        const pool = await connectDB();
        let query = 'SELECT * FROM Voucher WHERE 1=1';
        const request = pool.request();

        if (filter.code) {
            query += ' AND VoucherCode = @VoucherCode';
            request.input('VoucherCode', sql.NVarChar, filter.code);
        }
        if (filter._id) {
            query += ' AND VoucherID = @VoucherID';
            request.input('VoucherID', sql.Int, filter._id);
        }

        const result = await request.query(query);
        const row = result.recordset[0];
        if (!row) return null;
        
        return this._mapVoucher(row);
    },

    async find(filter = {}) {
        const pool = await connectDB();
        const request = pool.request();
        let query = 'SELECT * FROM Voucher WHERE 1=1';

        // Add filter if needed, currently returns all
        const result = await request.query(query);
        return result.recordset.map(this._mapVoucher);
    },

    async create(data) {
        const pool = await connectDB();
        const request = pool.request()
            .input('VoucherCode', sql.NVarChar, data.code)
            .input('Description', sql.NVarChar, data.description || '')
            .input('DiscountType', sql.NVarChar, data.discountType || 'fixed')
            .input('DiscountValue', sql.Decimal(18,2), data.discountValue)
            .input('MinOrderAmount', sql.Decimal(18,2), data.minOrderValue || 0)
            .input('MaxDiscountAmount', sql.Decimal(18,2), data.maxDiscountAmount || null)
            .input('ExpiryDate', sql.DateTime2, new Date(data.expirationDate))
            .input('UsageLimit', sql.Int, data.usageLimit || 100);

        const result = await request.query(`
            INSERT INTO Voucher (VoucherCode, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscountAmount, ExpiryDate, UsageLimit)
            OUTPUT INSERTED.*
            VALUES (@VoucherCode, @Description, @DiscountType, @DiscountValue, @MinOrderAmount, @MaxDiscountAmount, @ExpiryDate, @UsageLimit)
        `);
        
        return this._mapVoucher(result.recordset[0]);
    },

    async findByIdAndUpdate(id, data) {
        const pool = await connectDB();
        const request = pool.request().input('VoucherID', sql.Int, id);
        let updates = [];

        if (data.$inc && data.$inc.usedCount) {
            updates.push('UsedCount = UsedCount + @IncCount');
            request.input('IncCount', sql.Int, data.$inc.usedCount);
        }
        if (data.isActive !== undefined) {
            updates.push('IsActive = @IsActive');
            request.input('IsActive', sql.Bit, data.isActive ? 1 : 0);
        }

        if (updates.length > 0) {
            await request.query(`UPDATE Voucher SET ${updates.join(', ')} WHERE VoucherID = @VoucherID`);
        }
        
        return await this.findOne({ _id: id });
    },

    async findByIdAndDelete(id) {
        const pool = await connectDB();
        await pool.request()
            .input('VoucherID', sql.Int, id)
            .query('DELETE FROM Voucher WHERE VoucherID = @VoucherID');
        return true;
    },

    _mapVoucher(row) {
        return {
            _id: row.VoucherID,
            code: row.VoucherCode,
            description: row.Description,
            discountType: row.DiscountType,
            discountValue: row.DiscountValue,
            minOrderValue: row.MinOrderAmount,
            maxDiscountAmount: row.MaxDiscountAmount,
            expirationDate: row.ExpiryDate,
            usageLimit: row.UsageLimit,
            usedCount: row.UsedCount,
            isActive: row.IsActive,
            createdAt: row.CreatedAt
        };
    }
};

export default voucherModel;
