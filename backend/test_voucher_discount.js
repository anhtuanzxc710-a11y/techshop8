const BASE = 'http://localhost:5000';
import jwt from 'jsonwebtoken';

async function testRealDiscount() {
  try {
    // 1. Login user
    const login = await fetch(`${BASE}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'browsertest1778601948@test.com', password: 'Test123456' })
    });
    const { token, success, message } = await login.json();
    if (!success) {
        console.log('Login failed:', message);
        return;
    }

    // Decode token to get userId (manual for test script)
    const decoded = jwt.decode(token);
    const userId = decoded.id;
    console.log(`Loged in as User ID: ${userId}`);

    // 2. Create Order with Voucher
    const order = await fetch(`${BASE}/api/cart/create-cart`, {
      method: 'POST',
      headers: { token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        itemId: 1, // Xiaomi Redmi 15 (~4.3tr)
        totalItems: 1,
        paymentMethod: 'Cash',
        shippingAddress: 'Hanoi, Vietnam',
        voucherCode: 'TECHSHOP10' // Giảm 10%
      })
    });
    const orderData = await order.json();
    
    if (orderData.success) {
      console.log('--- ORDER CREATED SUCCESSFULLY ---');
      console.log(`Original Price: ${orderData.cartData.SubTotalAmount}₫`);
      console.log(`Discount: -${orderData.cartData.DiscountAmount}₫`);
      console.log(`Final Total: ${orderData.cartData.TotalAmount}₫`);
      
      const expectedTotal = orderData.cartData.SubTotalAmount - orderData.cartData.DiscountAmount;
      if (Math.abs(orderData.cartData.TotalAmount - expectedTotal) < 1) {
        console.log('✅ PASS: Discount correctly subtracted from total in DB.');
      } else {
        console.log('❌ FAIL: Price calculation mismatch!');
      }
    } else {
      console.log('FAIL:', orderData.message);
    }
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

testRealDiscount();
