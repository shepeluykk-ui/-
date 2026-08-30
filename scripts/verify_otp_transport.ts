import http from 'http';

async function runOtpTransportVerification() {
  console.log('=== OTP TRANSPORT & LIFECYCLE COMPREHENSIVE VERIFICATION ===\n');

  // Step 1: Check OTP Transport Configuration Status API
  console.log('--- 1. Checking OTP Transport Configuration Status ---');
  const statusRes = await makeRequest({
    path: '/api/auth/otp-transport-status',
    method: 'GET',
    headers: {}
  });

  console.log('Transport Status HTTP:', statusRes.statusCode);
  const statusJson = JSON.parse(statusRes.body);
  console.log('Transport Mode:', statusJson.transportStatus);
  console.log('Dev Mode Flag:', statusJson.devMode);
  console.log('Status Message:', statusJson.message);

  if (statusRes.statusCode !== 200 || !statusJson.success) {
    throw new Error('Failed to query /api/auth/otp-transport-status: ' + statusRes.body);
  }

  // Step 2: Register a new test user
  console.log('\n--- 2. Registering New User for OTP Verification ---');
  const uniqueLogin = `otp_user_${Date.now()}`;
  const registerPayload = {
    fullName: 'Егоров Дмитрий Сергеевич',
    phone: '+7 (918) 777-66-55',
    email: `d.egorov_${Date.now()}@skkit-test.ru`,
    organization: 'ООО «СтройТелеком»',
    position: 'Инженер-наладчик ОВиК',
    login: uniqueLogin,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  };

  const regRes = await makeRequest({
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });

  const regJson = JSON.parse(regRes.body);
  console.log('Registration Submitted:', regJson.success, 'RequestId:', regJson.requestId);
  if (!regJson.success || !regJson.requestId) {
    throw new Error('Registration submission failed: ' + regRes.body);
  }

  // Step 3: Super Admin Approves & Triggers OTP Dispatch
  console.log('\n--- 3. Super Admin Approves & Dispatches OTP ---');
  const approveRes = await makeRequest({
    path: `/api/admin/registration-requests/${regJson.requestId}/approve`,
    method: 'POST',
    headers: { 'x-user-id': 'usr-007' }
  });

  const approveJson = JSON.parse(approveRes.body);
  console.log('Approve HTTP Status:', approveRes.statusCode);
  console.log('Approve Success:', approveJson.success);
  console.log('Approve Response Message:', approveJson.message);
  console.log('Transport Delivery Status:', approveJson.transport);
  console.log('Delivery Channel:', approveJson.deliveryChannel);
  console.log('Generated OTP (Dev Payload):', approveJson.devOtp);

  if (!approveJson.success || !approveJson.devOtp || !/^\d{6}$/.test(approveJson.devOtp)) {
    throw new Error('Approval or OTP generation failed');
  }

  // Step 4: Verify 60s Rate Limiting on Immediate Resend
  console.log('\n--- 4. Testing 60-Second Resend Rate Limiting ---');
  const resendTooSoonRes = await makeRequest({
    path: '/api/auth/resend-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: regJson.requestId })
  });

  console.log('Resend Immediate HTTP Status:', resendTooSoonRes.statusCode, '(Expected 429)');
  const resendTooSoonJson = JSON.parse(resendTooSoonRes.body);
  console.log('Rate Limit Error Message:', resendTooSoonJson.error);
  if (resendTooSoonRes.statusCode !== 429) {
    throw new Error('Expected 429 Rate Limit on immediate OTP resend!');
  }

  // Step 5: Test Invalid OTP Attempt (Decrementing remaining attempts)
  console.log('\n--- 5. Testing Invalid OTP Code Verification ---');
  const invalidRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: regJson.requestId, code: '111222' })
  });

  console.log('Invalid Code HTTP Status:', invalidRes.statusCode);
  const invalidJson = JSON.parse(invalidRes.body);
  console.log('Remaining attempts:', invalidJson.remainingAttempts);
  if (invalidRes.statusCode === 200) {
    throw new Error('Invalid OTP passed verification unexpectedly!');
  }

  // Step 6: Test Valid OTP Verification & Account Activation
  console.log('\n--- 6. Testing Valid OTP Verification & Activation ---');
  const validRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: regJson.requestId, code: approveJson.devOtp })
  });

  console.log('Valid Code HTTP Status:', validRes.statusCode);
  const validJson = JSON.parse(validRes.body);
  console.log('Activation Success:', validJson.success);
  console.log('Activation User ID:', validJson.user?.id);
  if (!validJson.success || !validJson.user) {
    throw new Error('Valid OTP verification failed: ' + validRes.body);
  }

  // Step 7: Test Single-Use Protection (Replay attack prevention)
  console.log('\n--- 7. Testing OTP Single-Use (Replay Prevention) ---');
  const replayRes = await makeRequest({
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: regJson.requestId, code: approveJson.devOtp })
  });

  console.log('Replay Verification HTTP Status:', replayRes.statusCode);
  const replayJson = JSON.parse(replayRes.body);
  console.log('Replay Error Response:', replayJson.error);
  if (replayRes.statusCode === 200) {
    throw new Error('Used OTP was accepted a second time!');
  }

  console.log('\n=== ALL OTP TRANSPORT & LIFECYCLE TESTS PASSED PERFECTLY! ===\n');
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

runOtpTransportVerification().catch(err => {
  console.error('OTP Transport Verification Failed:', err);
  process.exit(1);
});
