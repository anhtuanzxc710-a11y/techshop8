import { sql, connectDB } from "../config/database.js";

export const getCategories = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT c.*, p.CategoryName as ParentCategoryName 
            FROM Category c 
            LEFT JOIN Category p ON c.ParentCategoryID = p.CategoryID
            ORDER BY c.CategoryName ASC
        `);
        res.json({ success: true, categories: result.recordset });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const addCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        if (!name) return res.json({ success: false, message: "Category name is required" });

        const pool = await connectDB();
        
        // Check if name exists
        const exist = await pool.request()
            .input('Name', sql.NVarChar, name)
            .query('SELECT CategoryID FROM Category WHERE CategoryName = @Name');
            
        if (exist.recordset.length > 0) {
            return res.json({ success: false, message: "Category name already exists" });
        }

        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('ParentID', sql.Int, parentId || null)
            .query('INSERT INTO Category (CategoryName, ParentCategoryID) VALUES (@Name, @ParentID)');

        res.json({ success: true, message: "Category added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id, name, parentId } = req.body;
        if (!id || !name) return res.json({ success: false, message: "ID and name are required" });

        const pool = await connectDB();
        
        // Check for circular dependency or duplicate name
        if (id === parentId) return res.json({ success: false, message: "Cannot be parent of itself" });

        await pool.request()
            .input('ID', sql.Int, id)
            .input('Name', sql.NVarChar, name)
            .input('ParentID', sql.Int, parentId || null)
            .query('UPDATE Category SET CategoryName = @Name, ParentCategoryID = @ParentID WHERE CategoryID = @ID');

        res.json({ success: true, message: "Category updated successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);
        console.log(`Attempting to delete category ID: ${categoryId}`);
        
        const pool = await connectDB();
        
        // Check if it's used as a parent
        const childCheck = await pool.request()
            .input('ID', sql.Int, categoryId)
            .query('SELECT CategoryID, CategoryName FROM Category WHERE ParentCategoryID = @ID');
            
        console.log('Child check results:', childCheck.recordset);
            
        if (childCheck.recordset.length > 0) {
            console.log('Deletion blocked: Category has sub-categories');
            return res.json({ success: false, message: "Cannot delete category with sub-categories" });
        }
        
        // Check if it's used in products
        const productCheck = await pool.request()
            .input('ID', sql.Int, categoryId)
            .query('SELECT TOP 1 ProductID FROM Product WHERE CategoryID = @ID');
            
        if (productCheck.recordset.length > 0) {
            console.log('Deletion blocked: Category is assigned to products');
            return res.json({ success: false, message: "Cannot delete category because it has products assigned" });
        }

        const deleteResult = await pool.request()
            .input('ID', sql.Int, categoryId)
            .query('DELETE FROM Category WHERE CategoryID = @ID');

        console.log('Delete result rows affected:', deleteResult.rowsAffected);

        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error('Delete category error:', error);
        res.json({ success: false, message: error.message });
    }
};
