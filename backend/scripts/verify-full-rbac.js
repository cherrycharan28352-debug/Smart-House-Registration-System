const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const http = require('http');

async function waitForServer(baseUrl = 'http://localhost:5000') {
  console.log(`Waiting for backend server at ${baseUrl} to be ready...`);
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.database && data.database.connected) {
          console.log(`Backend and Database are ready! (Host: ${data.database.host || 'in-memory'})\n`);
          return baseUrl;
        }
      }
    } catch (e) {
      // not yet up
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Server did not become ready within timeout.');
}

async function request(baseUrl, url, options = {}) {
  const fullUrl = `${baseUrl}${url}`;
  const headers = { ...options.headers };
  let body = options.body;

  if (body && typeof body === 'object' && !(body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, {
    method: options.method || 'GET',
    headers,
    body
  });

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('========================================================================');
  console.log('     MANE MANEGE POLICE — FULL END-TO-END RBAC VERIFICATION SUITE       ');
  console.log('========================================================================\n');

  const baseUrl = await waitForServer();
  console.log(`Target Backend Base URL: ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // Step 1: Health check
    // ------------------------------------------------------------------------
    console.log('--- PHASE 1: Health Check ---');
    const health = await request(baseUrl, '/api/health');
    assert(health.status === 200, 'Health endpoint responds with HTTP 200');

    // ------------------------------------------------------------------------
    // Step 2: Admin Authentication & Global Access
    // ------------------------------------------------------------------------
    console.log('\n--- PHASE 2: Admin Full Access ---');
    const adminLogin = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: process.env.ADMIN_PASSWORD || 'AdminPassword@2026' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin logs in successfully');
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Admin can see all 11 beats
    const adminBeats = await request(baseUrl, '/api/beats', { headers: adminHeaders });
    assert(
      adminBeats.status === 200 && adminBeats.data.data.length >= 11,
      `Admin retrieves all beats (found: ${adminBeats.data.data?.length || 0})`
    );

    // Admin can inspect Beat 01 and Beat 02
    const adminBeat1 = await request(baseUrl, '/api/beats/Beat 01', { headers: adminHeaders });
    const adminBeat2 = await request(baseUrl, '/api/beats/Beat 02', { headers: adminHeaders });
    assert(adminBeat1.status === 200, 'Admin accesses Beat 01 details');
    assert(adminBeat2.status === 200, 'Admin accesses Beat 02 details');

    // Admin can access users, audit logs, and settings
    const usersList = await request(baseUrl, '/api/users', { headers: adminHeaders });
    const auditLogs = await request(baseUrl, '/api/users/audit-logs', { headers: adminHeaders });
    const settings = await request(baseUrl, '/api/settings', { headers: adminHeaders });
    assert(usersList.status === 200, 'Admin accesses user management');
    assert(auditLogs.status === 200, 'Admin accesses audit logs');
    assert(settings.status === 200, 'Admin accesses system settings');

    // Admin can view global dashboard stats
    const adminStats = await request(baseUrl, '/api/dashboard/stats', { headers: adminHeaders });
    assert(adminStats.status === 200 && adminStats.data.data, 'Admin retrieves global dashboard stats');

    // ------------------------------------------------------------------------
    // Step 3: Staff Registration & Pending State Enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- PHASE 3: Staff Registration & Approval Workflow ---');
    const testStaffEmail = `test.officer.${Date.now()}@police.karnataka.gov.in`;
    const testStaffPassword = 'Password@Police123';
    const testStaffId = `OFF-${Date.now().toString().slice(-4)}`;

    const regRes = await request(baseUrl, '/api/auth/register-staff', {
      method: 'POST',
      body: {
        fullName: 'Officer Ramesh Kumar',
        staffId: testStaffId,
        mobileNumber: '9845012345',
        email: testStaffEmail,
        password: testStaffPassword,
        confirmPassword: testStaffPassword,
        requestedBeat: 'Beat 01'
      }
    });

    assert(regRes.status === 201, 'Staff registers successfully');
    assert(regRes.data.accountStatus === 'pending', 'New Staff account status defaults to "pending"');

    // Unapproved staff attempts login -> Must fail with 403
    const pendingLogin = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: testStaffEmail, password: testStaffPassword }
    });
    assert(pendingLogin.status === 403, 'Pending Staff login is BLOCKED with HTTP 403');

    // Admin lists pending users
    const pendingList = await request(baseUrl, '/api/users/pending', { headers: adminHeaders });
    const pendingUser = pendingList.data.data?.find((u) => u.email === testStaffEmail);
    assert(Boolean(pendingUser), 'Admin sees newly registered staff in pending users list');
    const staffUserId = pendingUser?._id;

    // Admin approves Staff and assigns Beat 01
    const approveRes = await request(baseUrl, `/api/users/${staffUserId}/approve`, {
      method: 'PUT',
      headers: adminHeaders,
      body: {
        assignedBeats: ['Beat 01'],
        assignedVillages: []
      }
    });
    assert(approveRes.status === 200, 'Admin approves staff and assigns Beat 01');

    // ------------------------------------------------------------------------
    // Step 4: Approved Staff Login & Scope Verification
    // ------------------------------------------------------------------------
    console.log('\n--- PHASE 4: Approved Staff Authentication & Beat-Wise Restrictions ---');
    const staffLogin = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: testStaffEmail, password: testStaffPassword }
    });
    assert(staffLogin.status === 200 && staffLogin.data.token, 'Approved Staff logs in successfully');
    const staffToken = staffLogin.data.token;
    const staffHeaders = { Authorization: `Bearer ${staffToken}` };

    // Staff calls GET /api/beats -> Should ONLY see Beat 01
    const staffBeats = await request(baseUrl, '/api/beats', { headers: staffHeaders });
    assert(
      staffBeats.status === 200 &&
      staffBeats.data.data.length === 1 &&
      staffBeats.data.data[0].beatNumber === 'Beat 01',
      `Staff sees ONLY assigned Beat 01 (received ${staffBeats.data.data?.length} beat(s))`
    );

    // Staff accesses assigned Beat 01 details -> 200 OK
    const staffBeat1 = await request(baseUrl, '/api/beats/Beat 01', { headers: staffHeaders });
    assert(staffBeat1.status === 200, 'Staff can access assigned Beat 01 details');

    // Staff attempts to access unassigned Beat 02 details -> 403 Forbidden!
    const staffBeat2 = await request(baseUrl, '/api/beats/Beat 02', { headers: staffHeaders });
    assert(staffBeat2.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from accessing Beat 02');

    // Staff attempts to query houses in Beat 02 -> 403 Forbidden!
    const staffHousesBeat2 = await request(baseUrl, '/api/houses?beatNumber=Beat 02', { headers: staffHeaders });
    assert(staffHousesBeat2.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from querying houses in Beat 02');

    // Staff queries houses in Beat 01 -> 200 OK
    const staffHousesBeat1 = await request(baseUrl, '/api/houses?beatNumber=Beat 01', { headers: staffHeaders });
    assert(staffHousesBeat1.status === 200, 'Staff queries houses in Beat 01 successfully');

    // Staff attempts to register a house in unauthorized Beat 02 -> 403 Forbidden!
    const unauthHouseRes = await request(baseUrl, '/api/houses', {
      method: 'POST',
      headers: staffHeaders,
      body: {
        houseNumber: `RBAC-UNAUTH-${Date.now().toString().slice(-4)}`,
        beatNumber: 'Beat 02',
        village: 'Kallugudda',
        ownerName: 'Unauthorized Owner',
        religion: 'Hindu',
        caste: 'General',
        address: 'Test Address'
      }
    });
    assert(unauthHouseRes.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from creating house in Beat 02');

    // Staff registers a house in assigned Beat 01 -> 201 Created!
    const authHouseRes = await request(baseUrl, '/api/houses', {
      method: 'POST',
      headers: staffHeaders,
      body: {
        houseNumber: `RBAC-AUTH-${Date.now().toString().slice(-4)}`,
        beatNumber: 'Beat 01',
        village: staffBeat1.data.data.villages[0]?.name || 'Test Village',
        ownerName: 'Authorized Owner',
        religion: 'Hindu',
        caste: 'General',
        address: '123 Authorized St'
      }
    });
    assert(authHouseRes.status === 201 && authHouseRes.data.data, 'Staff registers house in assigned Beat 01');
    const createdHouseId = authHouseRes.data.data?._id;

    // Staff updates their authorized house -> 200 OK
    const updateHouseRes = await request(baseUrl, `/api/houses/${createdHouseId}`, {
      method: 'PUT',
      headers: staffHeaders,
      body: {
        address: 'Updated 123 Authorized St'
      }
    });
    assert(updateHouseRes.status === 200, 'Staff can update house within assigned beat');

    // Staff attempts to tamper house to change its beat to Beat 02 -> 403 Forbidden!
    const tamperBeatRes = await request(baseUrl, `/api/houses/${createdHouseId}`, {
      method: 'PUT',
      headers: staffHeaders,
      body: {
        beatNumber: 'Beat 02'
      }
    });
    assert(tamperBeatRes.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from reassigning house to Beat 02');

    // Staff attempts to delete house -> 403 Forbidden! (Only Admin can delete)
    const staffDeleteRes = await request(baseUrl, `/api/houses/${createdHouseId}`, {
      method: 'DELETE',
      headers: staffHeaders
    });
    assert(staffDeleteRes.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from deleting house');

    // Staff attempts to access Admin endpoints (/api/users, /api/settings) -> 403 Forbidden!
    const staffUsers = await request(baseUrl, '/api/users', { headers: staffHeaders });
    const staffSettings = await request(baseUrl, '/api/settings', { headers: staffHeaders });
    assert(staffUsers.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from /api/users');
    assert(staffSettings.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from /api/settings');

    // Staff exports single house in Beat 01 -> 200 OK
    const staffExport1 = await request(baseUrl, `/api/houses/${createdHouseId}/export/excel`, { headers: staffHeaders });
    assert(staffExport1.status === 200, 'Staff can export house records in assigned Beat 01');

    // Admin creates a house in Beat 02 to test Staff export isolation
    const beat2HouseRes = await request(baseUrl, '/api/houses', {
      method: 'POST',
      headers: adminHeaders,
      body: {
        houseNumber: `RBAC-B02-${Date.now().toString().slice(-4)}`,
        beatNumber: 'Beat 02',
        village: 'Kallugudda',
        ownerName: 'Beat 2 Owner',
        religion: 'Hindu',
        caste: 'General',
        address: 'Beat 2 Address'
      }
    });
    const beat2HouseId = beat2HouseRes.data.data?._id;

    // Staff attempts to export single house in Beat 02 -> 403 Forbidden!
    const staffExportBeat2 = await request(baseUrl, `/api/houses/${beat2HouseId}/export/excel`, { headers: staffHeaders });
    assert(staffExportBeat2.status === 403, 'Staff is strictly BLOCKED (HTTP 403) from exporting houses in Beat 02');

    // Clean up Beat 2 house
    if (beat2HouseId) {
      await request(baseUrl, `/api/houses/${beat2HouseId}`, { method: 'DELETE', headers: adminHeaders });
    }

    // ------------------------------------------------------------------------
    // Step 5: Staff Deactivation & Instant Blocking
    // ------------------------------------------------------------------------
    console.log('\n--- PHASE 5: Staff Deactivation & Revocation ---');
    const deactivateRes = await request(baseUrl, `/api/users/${staffUserId}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { status: 'deactivated' }
    });
    assert(deactivateRes.status === 200, 'Admin deactivates Staff account');

    // Deactivated staff attempts request with existing token -> 403 Forbidden!
    const blockedReq = await request(baseUrl, `/api/houses/${createdHouseId}`, { headers: staffHeaders });
    assert(blockedReq.status === 403, 'Deactivated Staff is INSTANTLY BLOCKED (HTTP 403) from accessing data');

    // ------------------------------------------------------------------------
    // Step 6: Admin Cleanup
    // ------------------------------------------------------------------------
    console.log('\n--- PHASE 6: Admin Cleanup ---');
    const adminDeleteHouse = await request(baseUrl, `/api/houses/${createdHouseId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(adminDeleteHouse.status === 200, 'Admin deletes the test house successfully');

    const adminDeleteUser = await request(baseUrl, `/api/users/${staffUserId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(adminDeleteUser.status === 200, 'Admin deletes the test staff user successfully');

  } catch (err) {
    console.error('Unexpected error during verification:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL ROLE-BASED ACCESS CONTROL (RBAC) REQUIREMENTS VERIFIED 100%! ✓');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

run();
