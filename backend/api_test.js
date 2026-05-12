// Quick API integration test
const BASE = 'http://localhost:5000';

async function test() {
  try {
    // 1. Test products endpoint
    const products = await fetch(`${BASE}/api/product/get-products`);
    const prodData = await products.json();
    console.log(`[PRODUCTS] ${prodData.success ? 'PASS' : 'FAIL'} - ${prodData.products?.length || 0} products`);

    // 2. Test search
    const search = await fetch(`${BASE}/api/product/get-products?query=iPhone`);
    const searchData = await search.json();
    console.log(`[SEARCH:iPhone] ${searchData.success ? 'PASS' : 'FAIL'} - ${searchData.products?.length || 0} results`);

    // 3. Test register
    const email = `test${Date.now()}@example.com`;
    const reg = await fetch(`${BASE}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TestUser', email, password: 'Test123456' })
    });
    const regData = await reg.json();
    console.log(`[REGISTER] ${regData.success ? 'PASS' : 'FAIL'} - ${regData.message || ''}`);
    
    // 4. Test login
    const login = await fetch(`${BASE}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Test123456' })
    });
    const loginData = await login.json();
    console.log(`[LOGIN] ${loginData.success ? 'PASS' : 'FAIL'}`);
    const token = loginData.token;

    // 5. Test get-profile
    const profile = await fetch(`${BASE}/api/user/get-profile`, {
      headers: { token }
    });
    const profileData = await profile.json();
    console.log(`[PROFILE] ${profileData.success ? 'PASS' : 'FAIL'} - name: ${profileData.userData?.name || 'N/A'}`);

    // 6. Test update-profile
    const updateForm = new URLSearchParams();
    updateForm.append('name', 'Updated Name');
    updateForm.append('phone', '0987654321');
    updateForm.append('address', 'Hanoi, VN');
    updateForm.append('dob', '2000-01-01');
    updateForm.append('gender', 'Male');
    
    const update = await fetch(`${BASE}/api/user/update-profile`, {
      method: 'POST',
      headers: { token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: updateForm.toString()
    });
    const updateData = await update.json();
    console.log(`[UPDATE_PROFILE] ${updateData.success ? 'PASS' : 'FAIL'} - ${updateData.message || ''}`);

    // 7. Test notifications
    const notif = await fetch(`${BASE}/api/user/get-notifications`, {
      headers: { token }
    });
    const notifData = await notif.json();
    console.log(`[NOTIFICATIONS] ${notifData.success ? 'PASS' : 'FAIL'} - ${notifData.data?.length || 0} notifications`);

    // 8. Test product detail
    const detail = await fetch(`${BASE}/api/product/detail-product/1`);
    const detailData = await detail.json();
    console.log(`[PRODUCT_DETAIL] ${detailData.success ? 'PASS' : 'FAIL'} - ${detailData.data?.name || 'N/A'}`);

    // 9. Test voucher list
    const vouchers = await fetch(`${BASE}/api/voucher/list`);
    const voucherData = await vouchers.json();
    console.log(`[VOUCHERS] ${voucherData.success ? 'PASS' : 'FAIL'} - ${voucherData.vouchers?.length || 0} vouchers`);

    // 10. Test admin login
    const adminLogin = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tuannv7105@gmail.com', password: 'Tuan7105' })
    });
    const adminData = await adminLogin.json();
    console.log(`[ADMIN_LOGIN] ${adminData.success ? 'PASS' : 'FAIL'}`);
    const atoken = adminData.token;

    // 11. Test admin dashboard
    const dashboard = await fetch(`${BASE}/api/admin/admin-dashboard`, {
      headers: { atoken }
    });
    const dashData = await dashboard.json();
    console.log(`[ADMIN_DASHBOARD] ${dashData.success ? 'PASS' : 'FAIL'} - products: ${dashData.dashData?.qproducts || 'N/A'}`);

    // 12. Test cart list
    const cartList = await fetch(`${BASE}/api/cart/list-mycart`, {
      method: 'POST',
      headers: { token, 'Content-Type': 'application/json' },
      body: '{}'
    });
    const cartData = await cartList.json();
    console.log(`[CART_LIST] ${cartData.success ? 'PASS' : 'FAIL'} - ${cartData.cartData?.length || 0} orders`);

    // 13. Test comments
    const comments = await fetch(`${BASE}/api/comment/get-comments`, {
      headers: { token }
    });
    const commentsData = await comments.json();
    console.log(`[COMMENTS] ${commentsData.success ? 'PASS' : 'FAIL'} - ${commentsData.comments?.length || 0} comments`);

    // 14. Test category filter
    const catFilter = await fetch(`${BASE}/api/product/get-products?category=Smartphone`);
    const catData = await catFilter.json();
    console.log(`[FILTER:Smartphone] ${catData.success ? 'PASS' : 'FAIL'} - ${catData.products?.length || 0} results`);

    // 15. Test brand filter
    const brandFilter = await fetch(`${BASE}/api/product/get-products?brand=Apple`);
    const brandData = await brandFilter.json();
    console.log(`[FILTER:Apple] ${brandData.success ? 'PASS' : 'FAIL'} - ${brandData.products?.length || 0} results`);

    console.log('\n=== ALL API TESTS COMPLETE ===');
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

test();
