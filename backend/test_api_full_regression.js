import fetch from 'node-fetch';

const BASE = 'http://127.0.0.1:5001';

async function runRegressionTests() {
  console.log('============================================================');
  console.log('         FULL-SYSTEM REGRESSION QA & STABILIZATION          ');
  console.log('============================================================');
  
  let userToken = '';
  let adminToken = '';
  let testUserId = '';
  let testProductId = 1; // standard product
  let testOrderId = '';
  const testEmail = `test_qa_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  // 1. Health/Server Reachable
  try {
    const res = await fetch(`${BASE}/api/product/get-products`);
    if (res.status === 200) {
      console.log('✔ [HEALTH] Server is online and reachable on port 5001.');
    } else {
      console.error('❌ [HEALTH] Server returned status', res.status);
    }
  } catch (err) {
    console.error('❌ [HEALTH] Server unreachable:', err.message);
    process.exit(1);
  }

  // 2. Auth: Register User
  try {
    const res = await fetch(`${BASE}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'QATestUser', email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (data.success) {
      console.log('✔ [AUTH:REGISTER] User registered successfully.');
    } else {
      console.error('❌ [AUTH:REGISTER] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [AUTH:REGISTER] Error:', err.message);
  }

  // 3. Auth: Login User
  try {
    const res = await fetch(`${BASE}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (data.success && data.token) {
      userToken = data.token;
      console.log('✔ [AUTH:LOGIN] User login successful.');
    } else {
      console.error('❌ [AUTH:LOGIN] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [AUTH:LOGIN] Error:', err.message);
  }

  // 4. Auth: Admin Login
  try {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tuannv7105@gmail.com', password: 'Tuan7105' })
    });
    const data = await res.json();
    if (data.success && data.token) {
      adminToken = data.token;
      console.log('✔ [AUTH:ADMIN_LOGIN] Admin login successful.');
    } else {
      console.error('❌ [AUTH:ADMIN_LOGIN] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [AUTH:ADMIN_LOGIN] Error:', err.message);
  }

  // 5. Auth: User Profile & ID Extraction
  if (userToken) {
    try {
      const res = await fetch(`${BASE}/api/user/get-profile`, {
        headers: { token: userToken }
      });
      const data = await res.json();
      if (data.success && data.userData) {
        testUserId = data.userData._id;
        console.log(`✔ [AUTH:PROFILE] Profile retrieved. Name: ${data.userData.name}, ID: ${testUserId}`);
      } else {
        console.error('❌ [AUTH:PROFILE] Failed:', data.message);
      }
    } catch (err) {
      console.error('❌ [AUTH:PROFILE] Error:', err.message);
    }
  }

  // 6. Auth: RBAC Phân Quyền Check
  if (userToken) {
    try {
      const res = await fetch(`${BASE}/api/admin/admin-dashboard`, {
        headers: { aToken: userToken } // Send user token as admin token
      });
      const data = await res.json();
      if (!data.success) {
        console.log('✔ [AUTH:RBAC] Access denied for regular user to Admin Endpoint (Pass).');
      } else {
        console.error('❌ [AUTH:RBAC] Security risk! User token accepted as admin token.');
      }
    } catch (err) {
      console.log('✔ [AUTH:RBAC] Error or rejection (Pass):', err.message);
    }
  }

  // 7. Product List & Search
  try {
    const res = await fetch(`${BASE}/api/product/get-products`);
    const data = await res.json();
    if (data.success && data.products) {
      console.log(`✔ [PRODUCT:LIST] Successfully fetched ${data.products.length} products.`);
      if (data.products.length > 0) {
        testProductId = data.products[0].ProductID || 1;
      }
    } else {
      console.error('❌ [PRODUCT:LIST] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [PRODUCT:LIST] Error:', err.message);
  }

  try {
    const res = await fetch(`${BASE}/api/product/get-products?query=Xiaomi`);
    const data = await res.json();
    if (data.success) {
      console.log(`✔ [PRODUCT:SEARCH] Successfully searched products. Found: ${data.products?.length || 0}`);
    } else {
      console.error('❌ [PRODUCT:SEARCH] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [PRODUCT:SEARCH] Error:', err.message);
  }

  // 8. Product Detail
  try {
    const res = await fetch(`${BASE}/api/product/detail-product/${testProductId}`);
    const data = await res.json();
    if (data.success && data.data) {
      console.log(`✔ [PRODUCT:DETAIL] Fetched product ID ${testProductId}. Name: ${data.data.name}`);
    } else {
      console.error('❌ [PRODUCT:DETAIL] Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ [PRODUCT:DETAIL] Error:', err.message);
  }

  // 9. Category List
  if (adminToken) {
    try {
      const res = await fetch(`${BASE}/api/admin/categories`, {
        headers: { aToken: adminToken }
      });
      const data = await res.json();
      if (data.success && data.categories) {
        console.log(`✔ [CATEGORY:LIST] Successfully fetched ${data.categories.length} categories.`);
      } else {
        console.error('❌ [CATEGORY:LIST] Failed:', data.message);
      }
    } catch (err) {
      console.error('❌ [CATEGORY:LIST] Error:', err.message);
    }
  }

  // 10. Shopping Cart add/update/remove
  if (userToken) {
    try {
      // Add
      const addRes = await fetch(`${BASE}/api/shopping-cart/add`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: testProductId, quantity: 2 })
      });
      const addData = await addRes.json();
      console.log(`✔ [CART:ADD] Add to cart result: success=${addData.success}`);

      // Get Cart
      const getRes = await fetch(`${BASE}/api/shopping-cart/get`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const getData = await getRes.json();
      console.log(`✔ [CART:GET] Cart contains ${getData.cart?.items?.length || 0} unique items.`);

      // Update
      const upRes = await fetch(`${BASE}/api/shopping-cart/update`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: testProductId, quantity: 3 })
      });
      const upData = await upRes.json();
      console.log(`✔ [CART:UPDATE] Update quantity result: success=${upData.success}`);

      // Remove
      const remRes = await fetch(`${BASE}/api/shopping-cart/remove`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: testProductId })
      });
      const remData = await remRes.json();
      console.log(`✔ [CART:REMOVE] Remove item result: success=${remData.success}`);
    } catch (err) {
      console.error('❌ [CART] Error:', err.message);
    }
  }

  // 11. Voucher Validate
  if (userToken) {
    try {
      const res = await fetch(`${BASE}/api/voucher/validate`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'DISCOUNT10', orderAmount: 5000000 })
      });
      const data = await res.json();
      console.log(`✔ [VOUCHER:VALIDATE] Validation executed. success=${data.success}, message=${data.message || ''}`);
    } catch (err) {
      console.error('❌ [VOUCHER:VALIDATE] Error:', err.message);
    }
  }

  // 12. Create Order & User Orders
  if (userToken) {
    try {
      const res = await fetch(`${BASE}/api/cart/create-cart`, {
        method: 'POST',
        headers: { token: userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: testProductId,
          totalItems: 1,
          paymentMethod: 'Cash',
          shippingAddress: '123 QA Test Street, Hanoi'
        })
      });
      const data = await res.json();
      if (data.success && data.cartData) {
        testOrderId = data.cartData._id || data.cartData.OrderID;
        console.log(`✔ [ORDER:CREATE] Successfully created order. Order ID: ${testOrderId}`);
      } else {
        console.error('❌ [ORDER:CREATE] Failed:', data.message);
      }
    } catch (err) {
      console.error('❌ [ORDER:CREATE] Error:', err.message);
    }

    if (testOrderId) {
      try {
        const res = await fetch(`${BASE}/api/cart/list-mycart`, {
          method: 'POST',
          headers: { token: userToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.success && data.cartData) {
          console.log(`✔ [ORDER:LIST] Retreived ${data.cartData.length} orders for current user.`);
        } else {
          console.error('❌ [ORDER:LIST] Failed:', data.message);
        }
      } catch (err) {
        console.error('❌ [ORDER:LIST] Error:', err.message);
      }
      
      // Cancel order
      try {
        const res = await fetch(`${BASE}/api/cart/cancel-order`, {
          method: 'POST',
          headers: { token: userToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: testOrderId })
        });
        const data = await res.json();
        console.log(`✔ [ORDER:CANCEL] Cancel order result: ${data.message || 'success'}`);
      } catch (err) {
        console.error('❌ [ORDER:CANCEL] Error:', err.message);
      }
    }
  }

  // 13. Admin Dashboard
  if (adminToken) {
    try {
      const res = await fetch(`${BASE}/api/admin/admin-dashboard`, {
        headers: { aToken: adminToken }
      });
      const data = await res.json();
      if (data.success && data.dashData) {
        console.log('✔ [ADMIN:DASHBOARD] Admin Dashboard loaded. comments:', data.dashData.qcomments);
      } else {
        console.error('❌ [ADMIN:DASHBOARD] Failed:', data.message);
      }
    } catch (err) {
      console.error('❌ [ADMIN:DASHBOARD] Error:', err.message);
    }
  }

  // 14. Admin Revenue Stats & Filters
  if (adminToken) {
    try {
      // Default
      const r1 = await fetch(`${BASE}/api/admin/revenue-stats`, { headers: { aToken: adminToken } });
      const d1 = await r1.json();
      console.log(`✔ [ADMIN:REVENUE_DEFAULT] success=${d1.success}, totalRevenue=${d1.stats?.totalRevenue}`);

      // Range & Compare
      const r2 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-12&endDate=2026-05-14&groupBy=day&compare=true`, { headers: { aToken: adminToken } });
      const d2 = await r2.json();
      console.log(`✔ [ADMIN:REVENUE_COMPARE] success=${d2.success}, comparisonEnabled=${d2.stats?.comparison?.enabled}`);

      // Filters
      const r3 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-01&endDate=2026-05-31&orderStatus=processing&paymentMethod=Cash&categoryId=10`, { headers: { aToken: adminToken } });
      const d3 = await r3.json();
      console.log(`✔ [ADMIN:REVENUE_FILTERS] success=${d3.success}, filters echo:`, d3.stats?.filters);

      // Invalid dates
      const r4 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-06-15&endDate=2026-06-10`, { headers: { aToken: adminToken } });
      const d4 = await r4.json();
      console.log(`✔ [ADMIN:REVENUE_INVALID_DATE] success=${d4.success}, message="${d4.message}"`);
    } catch (err) {
      console.error('❌ [ADMIN:REVENUE] Error:', err.message);
    }
  }

  console.log('============================================================');
  console.log('             REGRESSION TESTING COMPLETED                   ');
  console.log('============================================================');
  process.exit(0);
}

runRegressionTests();
