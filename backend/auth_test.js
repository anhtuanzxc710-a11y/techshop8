// auth_test.js – simple test for signup, login, protected route
const base = process.env.BE_URL || 'http://localhost:5001';

async function register() {
  const res = await fetch(`${base}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'authtest', email: `auth${Date.now()}@example.com`, password: 'StrongPass1' })
  });
  return await res.json();
}

async function login(email, password) {
  const res = await fetch(`${base}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
}

async function getProfile(token) {
  const res = await fetch(`${base}/api/user/get-profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

(async () => {
  console.log('--- Auth System Test ---');
  const reg = await register();
  console.log('Register response:', reg);
  const email = reg.success ? reg.email : reg.email || 'test@example.com'; // fallback
  const pwd = 'StrongPass1';
  const loginRes = await login(email, pwd);
  console.log('Login response:', loginRes);
  if (loginRes.success) {
    const profile = await getProfile(loginRes.token);
    console.log('Protected profile response:', profile);
  }
  // Invalid login test
  const badLogin = await login(email, 'wrongpwd');
  console.log('Invalid login response (should fail):', badLogin);
})();
