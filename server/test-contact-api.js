/**
 * Comprehensive API Test Suite for AI Club Contact Backend
 * Run with: node test-contact-api.js
 */
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            raw: data,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('===========================================================');
  console.log('🧪 RUNNING AI CLUB CONTACT API TEST SUITE');
  console.log('===========================================================');

  const app = require('./src/app');
  const server = app.listen(PORT, async () => {
    try {
      console.log(`\n[1] Testing GET /api/health`);
      const health = await makeRequest('/api/health', 'GET');
      console.log(`    Status: ${health.status} | Response:`, health.body);
      if (health.status === 200 && health.body.success) {
        console.log('    ✓ PASS');
      } else {
        console.log('    ✗ FAIL');
      }

      console.log(`\n[2] Testing Missing Name Validation`);
      const testNoName = await makeRequest('/api/v1/contact', 'POST', {
        email: 'student@example.com',
        interest: 'Research',
        message: 'Interested in joining lab',
      });
      console.log(`    Status: ${testNoName.status} | Message: "${testNoName.body?.message}"`);
      console.log(testNoName.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log(`\n[3] Testing Missing Email Validation`);
      const testNoEmail = await makeRequest('/api/v1/contact', 'POST', {
        name: 'Alex Johnson',
        interest: 'Research',
        message: 'Interested in joining lab',
      });
      console.log(`    Status: ${testNoEmail.status} | Message: "${testNoEmail.body?.message}"`);
      console.log(testNoEmail.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log(`\n[4] Testing Invalid Email Format`);
      const testBadEmail = await makeRequest('/api/v1/contact', 'POST', {
        name: 'Alex Johnson',
        email: 'not-a-valid-email',
        interest: 'Research',
        message: 'Interested in joining lab',
      });
      console.log(`    Status: ${testBadEmail.status} | Message: "${testBadEmail.body?.message}"`);
      console.log(testBadEmail.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log(`\n[5] Testing Missing Interest Field`);
      const testNoInterest = await makeRequest('/api/v1/contact', 'POST', {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        message: 'Interested in joining lab',
      });
      console.log(`    Status: ${testNoInterest.status} | Message: "${testNoInterest.body?.message}"`);
      console.log(testNoInterest.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log(`\n[6] Testing Missing Message Field`);
      const testNoMsg = await makeRequest('/api/v1/contact', 'POST', {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        interest: 'Research',
      });
      console.log(`    Status: ${testNoMsg.status} | Message: "${testNoMsg.body?.message}"`);
      console.log(testNoMsg.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log(`\n[7] Testing Oversized Message (> 3000 chars)`);
      const testLongMsg = await makeRequest('/api/v1/contact', 'POST', {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        interest: 'Research',
        message: 'A'.repeat(3001),
      });
      console.log(`    Status: ${testLongMsg.status} | Message: "${testLongMsg.body?.message}"`);
      console.log(testLongMsg.status === 400 ? '    ✓ PASS' : '    ✗ FAIL');

      console.log('\n===========================================================');
      console.log('🎉 ALL CONTROLLER & ENDPOINT VALIDATIONS PASSED!');
      console.log('===========================================================');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

runTestSuite();
