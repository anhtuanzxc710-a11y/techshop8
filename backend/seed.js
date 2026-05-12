import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import userModel from "./models/userModel.js";

dotenv.config();

const seedData = async () => {
    try {
        // Kết nối DB
        await mongoose.connect(process.env.MONGOOSE_URI);
        console.log("Đang kết nối Database...");

        // Thông tin khách hàng demo
        const demoUserEmail = "customer@techshop.com";
        const demoUserPassword = "customer123";

        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await userModel.findOne({ email: demoUserEmail });

        if (existingUser) {
            console.log("Tài khoản khách hàng demo đã tồn tại!");
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(demoUserPassword, salt);

            const newUser = new userModel({
                name: "Demo Customer",
                email: demoUserEmail,
                password: hashedPassword,
                address: "Hà Nội, Việt Nam",
                phone: "0123456789",
                gender: "Other",
                dob: "2000-01-01"
            });

            await newUser.save();
            console.log("--------------------------------------");
            console.log("Đã tạo tài khoản KHÁCH HÀNG thành công!");
            console.log("Email: " + demoUserEmail);
            console.log("Password: " + demoUserPassword);
            console.log("--------------------------------------");
        }

        process.exit();
    } catch (error) {
        console.error("Lỗi khi tạo dữ liệu demo:", error);
        process.exit(1);
    }
};

seedData();
