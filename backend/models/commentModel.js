import { sql, connectDB } from "../config/database.js";

const commentModel = {
    _mapComment(row) {
        if (!row) return null;
        return {
            _id: row.CommentID,
            userId: row.UserID,
            productId: row.ProductID,
            rating: row.Rating,
            text: row.CommentText,
            createdAt: row.CreatedAt
        };
    },
    async findOne(filter) {
        const pool = await connectDB();
        let query = 'SELECT * FROM Comment WHERE 1=1';
        const request = pool.request();

        if (filter.userId) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }
        if (filter.productId) {
            query += ' AND ProductID = @ProductID';
            request.input('ProductID', sql.Int, filter.productId);
        }

        const result = await request.query(query);
        return this._mapComment(result.recordset[0]);
    },

    async findById(id) {
        const pool = await connectDB();
        const request = pool.request().input('CommentID', sql.Int, id);
        const result = await request.query('SELECT * FROM Comment WHERE CommentID = @CommentID');
        return this._mapComment(result.recordset[0]);
    },


    async find(filter = {}) {
        const pool = await connectDB();
        // Join with User and Product to provide embedded data
        let query = `
            SELECT 
                c.CommentID, c.UserID, c.ProductID, c.Rating, c.CommentText, c.CreatedAt,
                u.FullName as UserName, u.ProfileImage as UserImage,
                p.ProductName, p.ImageURL as ProductImage
            FROM Comment c
            INNER JOIN [User] u ON c.UserID = u.UserID
            INNER JOIN Product p ON c.ProductID = p.ProductID
            WHERE 1=1
        `;
        const request = pool.request();

        if (filter.userId) {
            query += ' AND c.UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }
        if (filter.productId) {
            query += ' AND c.ProductID = @ProductID';
            request.input('ProductID', sql.Int, filter.productId);
        }

        query += ' ORDER BY c.CreatedAt DESC';

        const result = await request.query(query);
        return result.recordset.map(row => ({
            _id: row.CommentID,
            userId: row.UserID,
            productId: row.ProductID,
            rating: row.Rating,
            text: row.CommentText,
            createdAt: row.CreatedAt,
            userData: {
                _id: row.UserID,
                name: row.UserName,
                image: row.UserImage
            },
            productData: {
                _id: row.ProductID,
                name: row.ProductName,
                image_url: row.ProductImage
            }
        }));
    },

    async create(data) {
        const pool = await connectDB();
        const request = pool.request()
            .input('UserID', sql.Int, data.userId)
            .input('ProductID', sql.Int, data.productId)
            .input('Rating', sql.Int, data.rating || null)
            .input('CommentText', sql.NVarChar, data.text)
            .query(`
                INSERT INTO Comment (UserID, ProductID, Rating, CommentText)
                OUTPUT INSERTED.CommentID
                VALUES (@UserID, @ProductID, @Rating, @CommentText)
            `);
        
        const result = await request;
        const newId = result.recordset[0].CommentID;
        const savedComment = await this.find({ userId: data.userId, productId: data.productId });
        return savedComment[0];
    },

    async update(filter, data) {
        const pool = await connectDB();
        const request = pool.request();
        let updates = [];
        
        if (data.text) {
            updates.push('CommentText = @Text');
            request.input('Text', sql.NVarChar, data.text);
        }
        if (data.rating !== undefined) {
            updates.push('Rating = @Rating');
            request.input('Rating', sql.Int, data.rating);
        }
        
        if (updates.length === 0) return await this.findOne(filter);

        updates.push('UpdatedAt = SYSDATETIME()');
        const query = `UPDATE Comment SET ${updates.join(', ')} WHERE UserID = @UserID AND ProductID = @ProductID`;
        
        request.input('UserID', sql.Int, filter.userId);
        request.input('ProductID', sql.Int, filter.productId);

        await request.query(query);
        const savedComment = await this.find(filter);
        return savedComment[0];
    }
};

export default commentModel;
