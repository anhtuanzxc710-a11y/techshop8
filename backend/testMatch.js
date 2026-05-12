import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAllFiles(dirPath, arrayOfFiles) {
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

const checkMatches = async () => {
    try {
        console.log("Fetching products from DB...");
        const products = await productModel.find({});
        console.log(`Found ${products.length} products.`);

        const imagesPath = path.resolve(__dirname, '../anhsp');
        console.log("Reading images from:", imagesPath);
        const imageFiles = await getAllFiles(imagesPath);
        console.log(`Found ${imageFiles.length} images.`);

        let matchCount = 0;

        for (const product of products) {
            let productName = product.name.trim().toLowerCase();
            
            const matchedFile = imageFiles.find(file => {
                const fileNameWithExt = path.basename(file);
                const ext = path.extname(fileNameWithExt);
                let fileName = path.basename(file, ext).trim().toLowerCase();
                
                return productName === fileName || productName.includes(fileName) || fileName.includes(productName);
            });

            if (matchedFile) {
                matchCount++;
                console.log(`[OK] Product: "${product.name}" -> File: "${path.basename(matchedFile)}"`);
            } else {
                console.log(`[MISS] No match for: "${product.name}"`);
            }
        }
        
        console.log(`Total Matched: ${matchCount} / ${products.length}`);
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkMatches();
