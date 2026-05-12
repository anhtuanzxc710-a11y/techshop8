import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import productModel from './models/productModel.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const importImages = async () => {
    try {
        console.log("Đang kết nối Database và lấy danh sách sản phẩm...");
        const products = await productModel.find({});
        console.log(`Đã tìm thấy ${products.length} sản phẩm trong Database.`);

        const imagesPath = path.resolve(__dirname, '../anhsp');
        console.log("Đang đọc thư mục ảnh:", imagesPath);
        const imageFiles = await getAllFiles(imagesPath);
        console.log(`Đã tìm thấy ${imageFiles.length} file ảnh.`);

        let matchCount = 0;
        let uploadCount = 0;

        for (const product of products) {
            let productName = product.name.trim().toLowerCase();
            
            // Tìm ảnh phù hợp
            const matchedFile = imageFiles.find(file => {
                const fileNameWithExt = path.basename(file);
                const ext = path.extname(fileNameWithExt);
                let fileName = path.basename(file, ext).trim().toLowerCase();
                
                return productName === fileName || productName.includes(fileName) || fileName.includes(productName);
            });

            if (matchedFile) {
                matchCount++;
                console.log(`[Khớp] Sản phẩm: "${product.name}" -> Ảnh: "${path.basename(matchedFile)}"`);
                console.log(`Đang tải ảnh lên Cloudinary...`);
                
                try {
                    const result = await cloudinary.uploader.upload(matchedFile, { folder: 'products' });
                    console.log(`-> Đã tải lên! URL: ${result.secure_url}`);
                    
                    // Cập nhật URL ảnh vào DB
                    await productModel.findByIdAndUpdate(product._id, { image_url: result.secure_url });
                    console.log(`-> Đã cập nhật ảnh cho sản phẩm ID: ${product._id}\n`);
                    uploadCount++;
                } catch (uploadError) {
                    console.error("-> Lỗi khi tải ảnh lên:", uploadError.message, "\n");
                }
            } else {
                console.log(`[Bỏ qua] Không tìm thấy ảnh khớp cho sản phẩm: "${product.name}"\n`);
            }
        }
        
        console.log(`Hoàn tất! Đã tìm thấy ${matchCount} ảnh khớp và tải lên ${uploadCount} ảnh.`);
        process.exit(0);

    } catch (error) {
        console.error("Lỗi khi chạy script:", error.message);
        process.exit(1);
    }
};

importImages();
