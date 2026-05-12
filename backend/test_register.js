import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';
import userModel from './models/userModel.js';

async function test() {
  try {
    const user = await userModel.create({
      name: 'Test User 3',
      email: `testuser${Date.now()}@example.com`,
      password: 'hashedpassword',
      role: 'Customer'
    });
    console.log('User created:', user);
  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    process.exit();
  }
}
test();
