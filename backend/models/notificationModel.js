import { sql, connectDB } from "../config/database.js";

const notificationModel = {
    async find(filter = {}) {
        const pool = await connectDB();
        let query = 'SELECT * FROM Notification WHERE 1=1';
        const request = pool.request();

        if (filter.userId) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }

        query += ' ORDER BY CreatedAt DESC';

        const result = await request.query(query);
        return result.recordset.map(row => ({
            _id: row.NotificationID,
            userId: row.UserID,
            message: row.NotificationText, // mapping NotificationText to message if needed
            text: row.NotificationText,
            isRead: row.IsRead,
            createdAt: row.CreatedAt
        }));
    },

    async create(data) {
        const pool = await connectDB();
        const request = pool.request()
            .input('UserID', sql.Int, data.userId)
            .input('NotificationText', sql.NVarChar, data.message || data.text)
            .input('IsRead', sql.Bit, data.isRead ? 1 : 0);

        const result = await request.query(`
            INSERT INTO Notification (UserID, NotificationText, IsRead)
            OUTPUT INSERTED.NotificationID
            VALUES (@UserID, @NotificationText, @IsRead)
        `);
        
        return {
            _id: result.recordset[0].NotificationID,
            ...data
        };
    },

    async findByIdAndUpdate(id, data) {
        const pool = await connectDB();
        const request = pool.request().input('NotificationID', sql.Int, id);
        let updates = [];

        if (data.isRead !== undefined) {
            updates.push('IsRead = @IsRead');
            request.input('IsRead', sql.Bit, data.isRead ? 1 : 0);
        }

        if (updates.length > 0) {
            await request.query(`UPDATE Notification SET ${updates.join(', ')} WHERE NotificationID = @NotificationID`);
        }
        return { _id: id, ...data };
    },
    
    // Support updateMany for marking all as read
    async updateMany(filter, data) {
        const pool = await connectDB();
        const request = pool.request();
        let query = 'UPDATE Notification SET ';

        if (data.isRead !== undefined) {
            query += 'IsRead = @IsRead ';
            request.input('IsRead', sql.Bit, data.isRead ? 1 : 0);
        }
        
        query += 'WHERE 1=1';

        if (filter.userId) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }

        await request.query(query);
        return { updated: true };
    }
};

export default notificationModel;
