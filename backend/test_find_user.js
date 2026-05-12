import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';
import userModel from './models/userModel.js';

async function test() {
  try {
    const user = await userModel.findOne({ email: 'testuser3@example.com' });
    console.log('User found:', user);
  } catch (err) {
    console.error('Error finding user:', err);
  } finally {
    process.exit();
  }
}
test();
