import fetch from 'node-fetch';

const BASE = 'http://127.0.0.1:5001';

async function runTests() {
  try {
    console.log('Sending login request to admin...');
    const loginRes = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tuannv7105@gmail.com', password: 'Tuan7105' })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Admin login failed:', loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('Admin login success. Token obtained.');

    // 1. Scenario 1: Default parameters (no params)
    console.log('\n--- Scenario 1: Default Parameters (30 days) ---');
    const res1 = await fetch(`${BASE}/api/admin/revenue-stats`, {
      headers: { 'aToken': token }
    });
    const data1 = await res1.json();
    console.log('Success:', data1.success);
    console.log('isMockData:', data1.isMockData);
    if (data1.success) {
      console.log('Stats totalRevenue:', data1.stats?.totalRevenue);
      console.log('Stats totalPaidOrders:', data1.stats?.totalPaidOrders);
      console.log('Stats averageOrderValue:', data1.stats?.averageOrderValue);
      console.log('Stats totalItemsSold:', data1.stats?.totalItemsSold);
      console.log('revenueSeries length:', data1.stats?.revenueSeries?.length);
      console.log('topProducts count:', data1.stats?.topProducts?.length);
      console.log('orderStatusStats:', data1.stats?.orderStatusStats);
    }

    // 2. Scenario 2: Valid custom range with compare=true
    console.log('\n--- Scenario 2: Custom range with compare=true (2026-05-12 to 2026-05-14) ---');
    const res2 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-12&endDate=2026-05-14&groupBy=day&compare=true`, {
      headers: { 'aToken': token }
    });
    const data2 = await res2.json();
    console.log('Success:', data2.success);
    console.log('isMockData:', data2.isMockData);
    if (data2.success) {
      console.log('Stats totalRevenue:', data2.stats?.totalRevenue);
      console.log('Comparison enabled:', data2.stats?.comparison?.enabled);
      console.log('Current Period stats:', data2.stats?.comparison?.currentPeriod);
      console.log('Previous Period stats:', data2.stats?.comparison?.previousPeriod);
      console.log('Changes:', data2.stats?.comparison?.changes);
    }

    // 3. Scenario 3: Date error range (startDate > endDate)
    console.log('\n--- Scenario 3: Date error range (2026-06-15 to 2026-06-10) ---');
    const res3 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-06-15&endDate=2026-06-10`, {
      headers: { 'aToken': token }
    });
    const data3 = await res3.json();
    console.log('Success:', data3.success);
    console.log('Message:', data3.message);

    // 4. Scenario 4: Advanced filters (orderStatus=processing)
    console.log('\n--- Scenario 4: Filter orderStatus=processing (2026-05-01 to 2026-05-31) ---');
    const res4 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-01&endDate=2026-05-31&orderStatus=processing`, {
      headers: { 'aToken': token }
    });
    const data4 = await res4.json();
    console.log('Success:', data4.success);
    if (data4.success) {
      console.log('Stats summary with status filter:', data4.stats?.summary);
      console.log('Filters applied:', data4.stats?.filters);
    }

    // 5. Scenario 5: Filter paymentMethod=Cash
    console.log('\n--- Scenario 5: Filter paymentMethod=Cash (2026-05-01 to 2026-05-31) ---');
    const res5 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-01&endDate=2026-05-31&paymentMethod=Cash`, {
      headers: { 'aToken': token }
    });
    const data5 = await res5.json();
    console.log('Success:', data5.success);
    if (data5.success) {
      console.log('Stats summary with paymentMethod filter:', data5.stats?.summary);
      console.log('Filters applied:', data5.stats?.filters);
      console.log('paymentMethodRevenue:', data5.stats?.paymentMethodRevenue);
    }

    // 6. Scenario 6: Filter categoryId=10
    console.log('\n--- Scenario 6: Filter categoryId=10 (2026-05-01 to 2026-05-31) ---');
    const res6 = await fetch(`${BASE}/api/admin/revenue-stats?startDate=2026-05-01&endDate=2026-05-31&categoryId=10`, {
      headers: { 'aToken': token }
    });
    const data6 = await res6.json();
    console.log('Success:', data6.success);
    if (data6.success) {
      console.log('Stats summary with category filter:', data6.stats?.summary);
      console.log('Filters applied:', data6.stats?.filters);
      console.log('categoryRevenue:', data6.stats?.categoryRevenue);
    }

    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
