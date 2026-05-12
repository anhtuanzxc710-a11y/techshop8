import { sql, connectDB } from "../config/database.js";

function mapUser(row) {
    if (!row) return null;
    return {
        _id: row.UserID,
        name: row.FullName,
        email: row.Email,
        password: row.PasswordHash,
        image: row.ProfileImage,
        role: row.RoleName,
        phone: row.Phone || '',
        address: row.Address || '',
        dob: row.DOB || '',
        gender: row.Gender || ''
    };
}

const userModel = {
    async findOne(filter) {
        const pool = await connectDB();
        let query = 'SELECT * FROM [User] WHERE 1=1';
        const request = pool.request();

        if (filter.email) {
            query += ' AND Email = @Email';
            request.input('Email', sql.NVarChar, filter.email);
        }
        if (filter._id) {
            query += ' AND UserID = @UserID';
            request.input('UserID', sql.Int, filter._id);
        }

        const result = await request.query(query);
        return mapUser(result.recordset[0]);
    },

    async find(filter = {}) {
        const pool = await connectDB();
        let query = 'SELECT * FROM [User] WHERE 1=1';
        const request = pool.request();

        // simple filter for role if needed
        if (filter.role) {
            query += ' AND RoleName = @Role';
            request.input('Role', sql.NVarChar, filter.role);
        }

        const result = await request.query(query);
        return result.recordset.map(mapUser);
    },

    async findById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UserID', sql.Int, id)
            .query('SELECT * FROM [User] WHERE UserID = @UserID');
        return mapUser(result.recordset[0]);
    },

    async create(userData) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('FullName', sql.NVarChar, userData.name)
            .input('Email', sql.NVarChar, userData.email)
            .input('PasswordHash', sql.NVarChar, userData.password)
            .input('RoleName', sql.NVarChar, userData.role || 'Customer')
            .query(`
                INSERT INTO [User] (FullName, Email, PasswordHash, RoleName)
                OUTPUT INSERTED.*
                VALUES (@FullName, @Email, @PasswordHash, @RoleName)
            `);
        return mapUser(result.recordset[0]);
    },

    async findByIdAndUpdate(id, data) {
        const pool = await connectDB();
        const request = pool.request().input('UserID', sql.Int, id);
        let updates = [];

        if (data.name) {
            updates.push('FullName = @FullName');
            request.input('FullName', sql.NVarChar, data.name);
        }
        if (data.image) {
            updates.push('ProfileImage = @ProfileImage');
            request.input('ProfileImage', sql.NVarChar, data.image);
        }
        if (data.password) {
            updates.push('PasswordHash = @PasswordHash');
            request.input('PasswordHash', sql.NVarChar, data.password);
        }
        if (data.phone !== undefined) {
            updates.push('Phone = @Phone');
            request.input('Phone', sql.NVarChar, data.phone);
        }
        if (data.address !== undefined) {
            updates.push('Address = @Address');
            request.input('Address', sql.NVarChar, data.address);
        }
        if (data.dob !== undefined) {
            updates.push('DOB = @DOB');
            request.input('DOB', sql.NVarChar, data.dob);
        }
        if (data.gender !== undefined) {
            updates.push('Gender = @Gender');
            request.input('Gender', sql.NVarChar, data.gender);
        }

        if (updates.length === 0) return this.findById(id);

        const query = `UPDATE [User] SET ${updates.join(', ')} OUTPUT INSERTED.* WHERE UserID = @UserID`;
        const result = await request.query(query);
        return mapUser(result.recordset[0]);
    },

    async findByIdAndDelete(id) {
        const pool = await connectDB();
        await pool.request()
            .input('UserID', sql.Int, id)
            .query('DELETE FROM [User] WHERE UserID = @UserID');
        return true;
    }
};

export default userModel;
