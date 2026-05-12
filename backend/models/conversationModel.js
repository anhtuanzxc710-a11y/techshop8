import { sql, connectDB } from "../config/database.js";

const conversationModel = {
    async findOne(filter) {
        const pool = await connectDB();
        let query = 'SELECT * FROM Conversation WHERE 1=1';
        const request = pool.request();

        if (filter.userId) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter.userId);
        }

        const result = await request.query(query);
        const conv = result.recordset[0];
        
        if (conv) {
            const msgResult = await pool.request()
                .input('ConversationID', sql.Int, conv.ConversationID)
                .query('SELECT * FROM ConversationMessage WHERE ConversationID = @ConversationID ORDER BY CreatedAt ASC');
            
            return {
                _id: conv.ConversationID,
                userId: conv.UserID,
                messages: msgResult.recordset.map(m => ({
                    sender: m.SenderType,
                    text: m.MessageContent,
                    timestamp: m.CreatedAt
                }))
            };
        }
        return null;
    },

    async create(data) {
        const pool = await connectDB();
        const request = pool.request()
            .input('UserID', sql.Int, data.userId);

        const result = await request.query(`
            INSERT INTO Conversation (UserID)
            OUTPUT INSERTED.ConversationID
            VALUES (@UserID)
        `);
        
        const convId = result.recordset[0].ConversationID;
        
        if (data.messages && data.messages.length > 0) {
            for (let msg of data.messages) {
                const msgReq = pool.request();
                await msgReq
                    .input('ConversationID', sql.Int, convId)
                    .input('SenderType', sql.NVarChar, msg.sender)
                    .input('MessageContent', sql.NVarChar, msg.text)
                    .query(`
                        INSERT INTO ConversationMessage (ConversationID, SenderType, MessageContent)
                        VALUES (@ConversationID, @SenderType, @MessageContent)
                    `);
            }
        }
        
        return await this.findOne({ userId: data.userId });
    },

    async updateOne(filter, updateData) {
        // Typically $push for new messages
        if (updateData.$push && updateData.$push.messages) {
            const pool = await connectDB();
            const conv = await this.findOne(filter);
            if (conv) {
                const msgReq = pool.request();
                await msgReq
                    .input('ConversationID', sql.Int, conv._id)
                    .input('SenderType', sql.NVarChar, updateData.$push.messages.sender)
                    .input('MessageContent', sql.NVarChar, updateData.$push.messages.text)
                    .query(`
                        INSERT INTO ConversationMessage (ConversationID, SenderType, MessageContent)
                        VALUES (@ConversationID, @SenderType, @MessageContent)
                    `);
                
                // Update UpdatedAt
                await pool.request()
                    .input('ConversationID', sql.Int, conv._id)
                    .query('UPDATE Conversation SET UpdatedAt = SYSDATETIME() WHERE ConversationID = @ConversationID');
            }
        }
        return { success: true };
    }
};

export default conversationModel;
