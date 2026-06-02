import { sql, connectDB } from "../config/database.js";

const productModel = {
    _mapProduct(p) {
        if (!p) return null;
        return {
            _id: p.ProductID,
            name: p.ProductName,
            brand: p.Brand,
            category: p.Category,
            price: p.Price,
            stock_quantity: p.StockQuantity,
            rating: p.Rating,
            available: p.IsAvailable,
            bestseller: p.IsBestSeller,
            image_url: p.ImageURL,
            dateAdded: p.ReleaseDate,
            specifications: p.specifications
        };
    },

    async findById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`
                SELECT p.*, b.BrandName as Brand, c.CategoryName as Category 
                FROM Product p
                LEFT JOIN Brand b ON p.BrandID = b.BrandID
                LEFT JOIN Category c ON p.CategoryID = c.CategoryID
                WHERE p.ProductID = @ProductID
            `);

        let product = result.recordset[0];
        if (product) {
            // Fetch specifications
            const specsResult = await pool.request()
                .input('ProductID', sql.Int, id)
                .query('SELECT SpecKey, SpecValue FROM ProductSpecification WHERE ProductID = @ProductID');

            product.specifications = {};
            specsResult.recordset.forEach(spec => {
                product.specifications[spec.SpecKey] = spec.SpecValue;
            });
            product = this._mapProduct(product);
        }
        return product;
    },

    async find(filter = {}) {
        const pool = await connectDB();
        let query = `
            SELECT p.*, b.BrandName as Brand, c.CategoryName as Category 
            FROM Product p
            LEFT JOIN Brand b ON p.BrandID = b.BrandID
            LEFT JOIN Category c ON p.CategoryID = c.CategoryID
            WHERE 1=1
        `;
        const request = pool.request();

        // 1. Filter by Category (Multi-select)
        if (filter.category && filter.category.length > 0) {
            const catParams = filter.category.map((_, i) => `@Cat${i}`).join(',');
            query += ` AND (c.CategoryName IN (${catParams}) OR c.CategorySlug IN (${catParams}))`;
            filter.category.forEach((cat, i) => {
                request.input(`Cat${i}`, sql.NVarChar, cat);
            });
        }

        // 2. Filter by Brand (Multi-select)
        if (filter.brand && filter.brand.length > 0) {
            const brandParams = filter.brand.map((_, i) => `@Brand${i}`).join(',');
            query += ` AND b.BrandName IN (${brandParams})`;
            filter.brand.forEach((br, i) => {
                request.input(`Brand${i}`, sql.NVarChar, br);
            });
        }

        // 3. Filter by Price Range
        if (filter.minPrice !== null && filter.minPrice !== undefined) {
            query += ' AND p.Price >= @MinPrice';
            request.input('MinPrice', sql.Decimal, filter.minPrice);
        }
        if (filter.maxPrice !== null && filter.maxPrice !== undefined) {
            query += ' AND p.Price <= @MaxPrice';
            request.input('MaxPrice', sql.Decimal, filter.maxPrice);
        }

        // 4. Search Query (Across name, brand, category)
        if (filter.search) {
            query += ` AND (p.ProductName LIKE @Search OR b.BrandName LIKE @Search OR c.CategoryName LIKE @Search)`;
            request.input('Search', sql.NVarChar, `%${filter.search}%`);
        }
        // 5. Filter by Bestseller
        if (filter.bestseller !== undefined && filter.bestseller !== null) {
            query += ' AND p.IsBestSeller = @BestSeller';
            request.input('BestSeller', sql.Bit, filter.bestseller ? 1 : 0);
        }

        query += ' ORDER BY p.ProductID DESC';

        const result = await request.query(query);
        const products = result.recordset;

        if (products.length > 0) {
            const productIds = products.map(p => p.ProductID);
            const specsResult = await pool.request()
                .query(`SELECT ProductID, SpecKey, SpecValue FROM ProductSpecification WHERE ProductID IN (${productIds.join(',')})`);
            
            const specsMap = {};
            specsResult.recordset.forEach(spec => {
                if (!specsMap[spec.ProductID]) {
                    specsMap[spec.ProductID] = {};
                }
                specsMap[spec.ProductID][spec.SpecKey] = spec.SpecValue;
            });

            products.forEach(p => {
                p.specifications = specsMap[p.ProductID] || {};
            });
        }

        return products.map(p => this._mapProduct(p));
    },

    async create(data) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            let brandId = null;
            if (data.brand) {
                const bReq = new sql.Request(transaction).input('BrandName', sql.NVarChar, data.brand);
                const bRes = await bReq.query('SELECT BrandID FROM Brand WHERE BrandName = @BrandName');
                if (bRes.recordset.length > 0) {
                    brandId = bRes.recordset[0].BrandID;
                } else {
                    const insBReq = new sql.Request(transaction).input('BrandName', sql.NVarChar, data.brand);
                    const insBRes = await insBReq.query('INSERT INTO Brand (BrandName) OUTPUT INSERTED.BrandID VALUES (@BrandName)');
                    brandId = insBRes.recordset[0].BrandID;
                }
            }

            let categoryId = null;
            if (data.category) {
                const cReq = new sql.Request(transaction).input('CatName', sql.NVarChar, data.category);
                const cRes = await cReq.query('SELECT CategoryID FROM Category WHERE CategoryName = @CatName');
                if (cRes.recordset.length > 0) {
                    categoryId = cRes.recordset[0].CategoryID;
                } else {
                    const insCReq = new sql.Request(transaction).input('CatName', sql.NVarChar, data.category);
                    const insCRes = await insCReq.query('INSERT INTO Category (CategoryName) OUTPUT INSERTED.CategoryID VALUES (@CatName)');
                    categoryId = insCRes.recordset[0].CategoryID;
                }
            }

            const request = new sql.Request(transaction);
            const result = await request
                .input('ProductName', sql.NVarChar, data.name)
                .input('Description', sql.NVarChar, data.description || '')
                .input('BrandID', sql.Int, brandId)
                .input('CategoryID', sql.Int, categoryId)
                .input('Price', sql.Decimal(18, 2), data.price || 500)
                .input('StockQuantity', sql.Int, data.stock_quantity)
                .input('IsAvailable', sql.Bit, data.available ? 1 : 0)
                .input('IsBestSeller', sql.Bit, data.bestseller ? 1 : 0)
                .input('ImageURL', sql.NVarChar, data.image_url)
                .query(`
                    INSERT INTO Product (ProductName, Description, BrandID, CategoryID, Price, StockQuantity, IsAvailable, IsBestSeller, ImageURL, ReleaseDate)
                    OUTPUT INSERTED.ProductID
                    VALUES (@ProductName, @Description, @BrandID, @CategoryID, @Price, @StockQuantity, @IsAvailable, @IsBestSeller, @ImageURL, GETDATE())
                `);

            const productId = result.recordset[0].ProductID;

            // Handle multiple images
            if (data.images && data.images.length > 0) {
                for (const imgUrl of data.images) {
                    const imgReq = new sql.Request(transaction);
                    await imgReq
                        .input('ProductID', sql.Int, productId)
                        .input('ImageURL', sql.NVarChar, imgUrl)
                        .query(`INSERT INTO ProductImage (ProductID, ImageURL) VALUES (@ProductID, @ImageURL)`);
                }
            }

            if (data.specifications) {
                for (const [key, value] of Object.entries(data.specifications)) {
                    const specReq = new sql.Request(transaction);
                    await specReq
                        .input('ProductID', sql.Int, productId)
                        .input('SpecKey', sql.NVarChar, key)
                        .input('SpecValue', sql.NVarChar, String(value))
                        .query(`INSERT INTO ProductSpecification (ProductID, SpecKey, SpecValue) VALUES (@ProductID, @SpecKey, @SpecValue)`);
                }
            }

            await transaction.commit();
            return await this.findById(productId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async findByIdAndUpdate(id, data) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction).input('ProductID', sql.Int, id);
            let updates = [];

            if (data.name !== undefined) { updates.push('ProductName = @ProductName'); request.input('ProductName', sql.NVarChar, data.name); }
            if (data.description !== undefined) { updates.push('Description = @Description'); request.input('Description', sql.NVarChar, data.description); }
            
            if (data.brand !== undefined) { 
                let brandId = null;
                const bReq = new sql.Request(transaction).input('BrandName', sql.NVarChar, data.brand);
                const bRes = await bReq.query('SELECT BrandID FROM Brand WHERE BrandName = @BrandName');
                if (bRes.recordset.length > 0) {
                    brandId = bRes.recordset[0].BrandID;
                } else {
                    const insBReq = new sql.Request(transaction).input('BrandName', sql.NVarChar, data.brand);
                    const insBRes = await insBReq.query('INSERT INTO Brand (BrandName) OUTPUT INSERTED.BrandID VALUES (@BrandName)');
                    brandId = insBRes.recordset[0].BrandID;
                }
                updates.push('BrandID = @BrandID'); 
                request.input('BrandID', sql.Int, brandId); 
            }
            
            if (data.category !== undefined) { 
                let categoryId = null;
                const cReq = new sql.Request(transaction).input('CatName', sql.NVarChar, data.category);
                const cRes = await cReq.query('SELECT CategoryID FROM Category WHERE CategoryName = @CatName');
                if (cRes.recordset.length > 0) {
                    categoryId = cRes.recordset[0].CategoryID;
                } else {
                    const insCReq = new sql.Request(transaction).input('CatName', sql.NVarChar, data.category);
                    const insCRes = await insCReq.query('INSERT INTO Category (CategoryName) OUTPUT INSERTED.CategoryID VALUES (@CatName)');
                    categoryId = insCRes.recordset[0].CategoryID;
                }
                updates.push('CategoryID = @CategoryID'); 
                request.input('CategoryID', sql.Int, categoryId); 
            }

            if (data.price !== undefined) { updates.push('Price = @Price'); request.input('Price', sql.Decimal, data.price); }
            if (data.stock_quantity !== undefined) { updates.push('StockQuantity = @StockQuantity'); request.input('StockQuantity', sql.Int, data.stock_quantity); }
            if (data.available !== undefined) { updates.push('IsAvailable = @IsAvailable'); request.input('IsAvailable', sql.Bit, data.available ? 1 : 0); }
            if (data.bestseller !== undefined) { updates.push('IsBestSeller = @IsBestSeller'); request.input('IsBestSeller', sql.Bit, data.bestseller ? 1 : 0); }
            if (data.image_url !== undefined) { updates.push('ImageURL = @ImageURL'); request.input('ImageURL', sql.NVarChar, data.image_url); }

            // For stock increment (from order cancel)
            if (data.$inc && data.$inc.stock_quantity) {
                updates.push('StockQuantity = StockQuantity + @IncStock');
                request.input('IncStock', sql.Int, data.$inc.stock_quantity);
            }

            if (updates.length > 0) {
                await request.query(`UPDATE Product SET ${updates.join(', ')} WHERE ProductID = @ProductID`);
            }

            if (data.specifications) {
                const delReq = new sql.Request(transaction).input('ProductID', sql.Int, id);
                await delReq.query(`DELETE FROM ProductSpecification WHERE ProductID = @ProductID`);

                for (const [key, value] of Object.entries(data.specifications)) {
                    const specReq = new sql.Request(transaction);
                    await specReq
                        .input('ProductID', sql.Int, id)
                        .input('SpecKey', sql.NVarChar, key)
                        .input('SpecValue', sql.NVarChar, String(value))
                        .query(`INSERT INTO ProductSpecification (ProductID, SpecKey, SpecValue) VALUES (@ProductID, @SpecKey, @SpecValue)`);
                }
            }

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async findByIdAndDelete(id) {
        const pool = await connectDB();
        await pool.request()
            .input('ProductID', sql.Int, id)
            .query('DELETE FROM Product WHERE ProductID = @ProductID');
        return true;
    }
};

export default productModel;
