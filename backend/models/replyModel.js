import { sql, connectDB } from "../config/database.js";

const replyModel = {
    async find(filter = {}) {
        const pool = await connectDB();
        let query = 'SELECT * FROM Reply WHERE 1=1';
        const request = pool.request();

        if (filter.commentId) {
            query += ' AND CommentID = @CommentID';
            request.input('CommentID', sql.Int, filter.commentId);
        }

        const result = await request.query(query);
        return result.recordset.map(row => ({
            _id: row.ReplyID,
            commentId: row.CommentID,
            text: row.ReplyText,
            createdAt: row.CreatedAt
        }));
    },

    async create(data) {
        const pool = await connectDB();
        const request = pool.request()
            .input('CommentID', sql.Int, data.commentId)
            .input('UserID', sql.Int, data.userId)
            .input('ReplyText', sql.NVarChar, data.text);

        const result = await request.query(`
            INSERT INTO Reply (CommentID, UserID, ReplyText)
            OUTPUT INSERTED.ReplyID
            VALUES (@CommentID, @UserID, @ReplyText)
        `);
        
        return {
            _id: result.recordset[0].ReplyID,
            ...data
        };
    }
};

export default replyModel;
