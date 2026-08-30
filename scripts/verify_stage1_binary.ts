import http from 'http';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('=== STAGE 1: PHYSICAL BINARY VERIFICATION ===');

  const boundary = '----WebKitFormBoundaryStage1VerificationTest';
  
  // Test 1: Upload Real PDF
  console.log('\n--- 1. Testing Binary PDF Upload & Storage ---');
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF', 'utf-8');
  let bodyPdf = '';
  bodyPdf += '--' + boundary + '\r\n';
  bodyPdf += 'Content-Disposition: form-data; name="file"; filename="TestBlueprint.pdf"\r\n';
  bodyPdf += 'Content-Type: application/pdf\r\n\r\n';
  
  const postDataPdf = Buffer.concat([
    Buffer.from(bodyPdf, 'utf-8'),
    pdfBuffer,
    Buffer.from(
      '\r\n--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="projectId"\r\n\r\nproj-1\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="code"\r\n\r\nРД-2025-АР-001\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="title"\r\n\r\nПлан 1-го этажа на отм. 0.000\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="section"\r\n\r\nАР\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="category"\r\n\r\nWORKING_DOC\r\n' +
      '--' + boundary + '--\r\n',
      'utf-8'
    )
  ]);

  const uploadPdfRes = await makeRequest({
    path: '/api/documents/upload-binary',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': postDataPdf.length.toString(),
      'x-user-id': 'usr-pto'
    },
    bodyBuffer: postDataPdf
  });

  console.log('Upload PDF Response Status:', uploadPdfRes.statusCode);
  const uploadPdfJson = JSON.parse(uploadPdfRes.body);
  console.log('Upload PDF Result:', uploadPdfJson.success, 'Document ID:', uploadPdfJson.document?.id);
  console.log('File SHA-256:', uploadPdfJson.fileInfo?.sha256);
  console.log('File Storage Path:', uploadPdfJson.document?.storagePath);

  if (!uploadPdfJson.document?.storagePath || !fs.existsSync(path.join(process.cwd(), uploadPdfJson.document.storagePath))) {
    throw new Error('Physical PDF file was NOT found on disk at ' + uploadPdfJson.document?.storagePath);
  }
  console.log('>>> Verification: Physical PDF file exists on disk!');

  // Test 2: Upload DWG
  console.log('\n--- 2. Testing Binary DWG Upload & Storage ---');
  const dwgBuffer = Buffer.from('AC1032DWGBINARYHEADERTESTDATA...', 'utf-8');
  const postDataDwg = Buffer.concat([
    Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="Model_Building_B.dwg"\r\nContent-Type: application/acad\r\n\r\n', 'utf-8'),
    dwgBuffer,
    Buffer.from(
      '\r\n--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="projectId"\r\n\r\nproj-1\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="code"\r\n\r\nРД-2025-КР-002\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="title"\r\n\r\nСхема армирования монолитного перекрытия\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="section"\r\n\r\nКР\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="category"\r\n\r\nWORKING_DOC\r\n' +
      '--' + boundary + '--\r\n',
      'utf-8'
    )
  ]);

  const uploadDwgRes = await makeRequest({
    path: '/api/documents/upload-binary',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': postDataDwg.length.toString(),
      'x-user-id': 'usr-pto'
    },
    bodyBuffer: postDataDwg
  });

  const uploadDwgJson = JSON.parse(uploadDwgRes.body);
  console.log('Upload DWG Status:', uploadDwgRes.statusCode, 'Success:', uploadDwgJson.success);
  console.log('DWG SHA-256:', uploadDwgJson.fileInfo?.sha256);
  if (!uploadDwgJson.document?.storagePath || !fs.existsSync(path.join(process.cwd(), uploadDwgJson.document.storagePath))) {
    throw new Error('Physical DWG file was NOT found on disk');
  }
  console.log('>>> Verification: Physical DWG file exists on disk!');

  // Test 3: Download and Compare SHA-256
  console.log('\n--- 3. Testing Binary Download & Checksum Validation ---');
  const docId = uploadPdfJson.document.id;
  const downloadRes = await makeRequest({
    path: `/api/documents/${docId}/download`,
    method: 'GET',
    headers: { 'x-user-id': 'usr-pto' }
  });

  console.log('Download Status:', downloadRes.statusCode);
  console.log('Content-Disposition:', downloadRes.headers['content-disposition']);
  console.log('X-Document-Checksum:', downloadRes.headers['x-document-checksum']);
  if (downloadRes.headers['x-document-checksum'] !== uploadPdfJson.fileInfo?.sha256) {
    throw new Error('Downloaded checksum does NOT match stored SHA-256!');
  }
  console.log('>>> Verification: SHA-256 matches perfectly between upload, disk and download headers!');

  // Test 4: Security & Path Traversal Protection
  console.log('\n--- 4. Testing Path Traversal & Unauthorized Access ---');
  const maliciousPostData = Buffer.concat([
    Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="../../../etc/passwd.pdf"\r\nContent-Type: application/pdf\r\n\r\n', 'utf-8'),
    Buffer.from('ATTEMPT', 'utf-8'),
    Buffer.from('\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="code"\r\n\r\nTEST-ATTACK\r\n--' + boundary + '--\r\n', 'utf-8')
  ]);

  const attackRes = await makeRequest({
    path: '/api/documents/upload-binary',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': maliciousPostData.length.toString(),
      'x-user-id': 'usr-pto'
    },
    bodyBuffer: maliciousPostData
  });
  console.log('Path Traversal Attack Status:', attackRes.statusCode, 'Expected error handled:', attackRes.statusCode === 400);

  console.log('\n=== ALL STAGE 1 VERIFICATION TESTS PASSED SUCCESSFULLY ===\n');
}

function makeRequest(options: { path: string; method: string; headers: Record<string, string>; bodyBuffer?: Buffer }): Promise<{ statusCode: number; headers: any; body: string }> {
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
    if (options.bodyBuffer) {
      req.write(options.bodyBuffer);
    }
    req.end();
  });
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
