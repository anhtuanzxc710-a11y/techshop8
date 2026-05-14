import { sql, connectDB } from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const addColumn = async () => {
    try {
        const pool = await connectDB();
        await pool.request().query("ALTER TABLE Comment ADD OrderID INT NULL");
        console.log("Added OrderID column to Comment table");
        
        // Let's add foreign key
        try {
            await pool.request().query("ALTER TABLE Comment ADD CONSTRAINT FK_Comment_Order FOREIGN KEY (OrderID) REFERENCES [Order](OrderID)");
            console.log("Added Foreign Key constraint");
        } catch(e) {
            console.log("Could not add FK:", e.message);
        }
        process.exit(0);
    } catch(err) {
        console.error("Column might already exist:", err.message);
        process.exit(1);
    }
}
addColumn();
