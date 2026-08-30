import http from 'http';

async function runStage2Tests() {
  console.log('=== STAGE 2: SUPER ADMIN REGISTRATION ALERT & OTP VERIFICATION ===\n');

  // Step 1: Submit a new registration request
  console.log('--- 1. Submitting New Registration Request ---');
  const uniqueLogin = `engineer_${Date.now()}`;
  const registerPayload = {
    fullName: 'Воронов Станислав Петрович',
    phone: '+7 (912) 345-67-89',
    email: `s.voronov_${Date.now()}@spetsstroy.ru`,
    organization: 'ООО «СпецСтрой Инжиниринг»',
    position: 'Ведущий инженер ОВиК',
    login: uniqueLogin,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  const regRes = await makeRequest({
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });

  console.log('Register Response Status:', regRes.statusCode);
  const regJson = JSON.parse(regRes.body);
  console.log('Register Result:', regJson.success, 'RequestId:', regJson.requestId);
  if (!regJson.success || !regJson.requestId) {
    throw new Error('Registration failed: ' + regRes.body);
  }

  // Step 2: Super Admin receives the pending request
  console.log('\n--- 2. Super Admin Receives Pending Alert Request ---');
  const adminRes = await makeRequest({
    path: '/api/admin/registration-requests',
    method: 'GET',
    headers: { 'x-user-id': 'usr-007' }
  });

  console.log('Admin Fetch Status:', adminRes.statusCode);
  const adminJson = JSON.parse(adminRes.body);
  const targetRequest = adminJson.requests?.find((r: any) => r.id === regJson.requestId);
  console.log('Target Request Found in Admin Queue:', !!targetRequest);
  console.log('Request Status:', targetRequest?.status, 'Login:', targetRequest?.login);

  if (!targetRequest || targetRequest.status !== 'PENDING') {
    throw new Error('Pending request was not found in admin queue with PENDING status');
  }

  // Step 3: Super Admin Approves Request -> Generates 6-digit OTP
  console.log('\n--- 3. Super Admin Approves Request (Generating 6-digit OTP) ---');
  const approveRes = await makeRequest({
    path: `/api/admin/registration-requests/${targetRequest.id}/approve`,
    method: 'POST',
    headers: { 'x-user-id': 'usr-007' }
  });

  console.log('Approve Status:', approveRes.statusCode);
  const approveJson = JSON.parse(approveRes.body);
  console.log('Approve Success:', approveJson.success);
  console.log('Generated OTP Code:', approveJson.devOtp);

  if (!approveJson.devOtp || !/^\d{6}$/.test(approveJson.devOtp)) {
    throw new Error('Invalid OTP generated: ' + approveJson.devOtp);
  }

  // Step 4: Test 60-Second Resend Rate Limiting
  console.log('\n--- 4. Testing OTP 60s Rate Limiting ---');
  const resendTooSoonRes = await makeRequest({
    path: '/api/auth/resend-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: targetRequest.id })
  });

  console.log('Resend Too Soon Status:', resendTooSoonRes.statusCode, '(Expected 429 Rate Limit)');
  const resendTooSoonJson = JSON.parse(resendTooSoonRes.body);
  console.log('Rate Limit Error Message:', resendTooSoonJson.error);
  if (resendTooSoonRes.statusCode !== 429) {
    throw new Error('Expected 429 rate limit on immediate OTP resend!');
  }

  // Step 5: Test Invalid Code Attempt
  console.log('\n--- 5. Testing Invalid OTP Code Verification ---');
  const invalidVerifyRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: targetRequest.id, code: '000000' })
  });

  console.log('Invalid Code Verification Status:', invalidVerifyRes.statusCode);
  const invalidVerifyJson = JSON.parse(invalidVerifyRes.body);
  console.log('Remaining attempts:', invalidVerifyJson.remainingAttempts);
  if (invalidVerifyRes.statusCode === 200) {
    throw new Error('Invalid OTP should NOT pass verification!');
  }

  // Step 6: Test Valid OTP Code Verification & User Activation
  console.log('\n--- 6. Testing Valid OTP Verification & Account Activation ---');
  const validVerifyRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: targetRequest.id, code: approveJson.devOtp })
  });

  console.log('Valid Code Verification Status:', validVerifyRes.statusCode);
  const validVerifyJson = JSON.parse(validVerifyRes.body);
  console.log('Verification Success:', validVerifyJson.success, 'Message:', validVerifyJson.message);
  if (!validVerifyJson.success) {
    throw new Error('Valid OTP verification failed: ' + validVerifyRes.body);
  }

  // Step 7: Test OTP Single-Use (Re-verification with used code must fail)
  console.log('\n--- 7. Testing OTP Single-Use Protection ---');
  const reuseVerifyRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: targetRequest.id, code: approveJson.devOtp })
  });

  console.log('Re-verification Status:', reuseVerifyRes.statusCode);
  const reuseVerifyJson = JSON.parse(reuseVerifyRes.body);
  console.log('Re-verification Error:', reuseVerifyJson.error);
  if (reuseVerifyRes.statusCode === 200) {
    throw new Error('Used OTP was accepted again! Single-use violation.');
  }

  console.log('\n=== ALL STAGE 2 SUPER ADMIN REGISTRATION ALERT & OTP TESTS PASSED! ===\n');
}

function makeRequest(options: { path: string; method: string; headers: Record<string, string>; body?: string }): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: options.path,
      method: options.method,
      headers: options.headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

runStage2Tests().catch(err => {
  console.error('Stage 2 Test Failed:', err);
  process.exit(1);
});
