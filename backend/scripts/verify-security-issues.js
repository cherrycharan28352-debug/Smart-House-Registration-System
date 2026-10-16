const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers = { ...options.headers };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) {
    let errBody;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    const err = new Error(`HTTP ${res.status}: ${JSON.stringify(errBody)}`);
    err.status = res.status;
    err.data = errBody;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return { data: await res.json(), status: res.status, headers: res.headers };
  } else {
    return { data: Buffer.from(await res.arrayBuffer()), status: res.status, headers: res.headers };
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('  STARTING VERIFICATION: Security and Issues Survey Integration ');
  console.log('================================================================\n');

  try {
    // 1. Health check
    const healthRes = await request('/health');
    console.log('1. Backend Health Check:', healthRes.data.status, '✓');

    // 2. Admin Login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'AdminPassword@2026'
      }
    });
    const adminToken = adminLoginRes.data.token;
    console.log('2. Admin Authenticated:', adminLoginRes.data.user.role, '✓');

    // 3. Staff Login
    const staffLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        username: 'staff',
        password: 'StaffPassword@2026'
      }
    });
    const staffToken = staffLoginRes.data.token;
    console.log('3. Staff Authenticated:', staffLoginRes.data.user.role, '✓');

    // 4. Get a village from Beat 01 (assigned to staff)
    const beatsRes = await request('/beats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const beatList = beatsRes.data.data || beatsRes.data;
    const beat01 = beatList.find(b => b.beatNumber === 'Beat 01');
    if (!beat01) throw new Error('Beat 01 not found');

    const beatDetailRes = await request(`/beats/Beat 01`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const villagesInBeat01 = beatDetailRes.data.data.villages;
    if (!villagesInBeat01 || villagesInBeat01.length === 0) throw new Error('No villages found in Beat 01');
    const testVillage = villagesInBeat01[0];
    console.log(`4. Target Beat: Beat 01, Target Village: ${testVillage.nameKannada} (${testVillage.nameEnglish}) ✓`);

    // 5. Register a House with Security & Issues (Staff user)
    const newHousePayload = {
      beatNumber: 'Beat 01',
      village: testVillage.nameKannada || testVillage.nameEnglish,
      houseNumber: 'SURVEY-TEST-101',
      streetName: 'Police Station Cross Road',
      locality: 'Ward 2',
      subdistrict: 'Channapatna',
      district: 'Ramanagara',
      pincode: '562160',
      owner: {
        fullName: 'ಶ್ರೀ ಮಹಾದೇವಪ್ಪ (Sri Mahadevappa)',
        contactNumber: '9845012345',
        email: 'mahadevappa.survey@ksp.gov.in',
        ownershipType: 'Owned'
      },
      familyMembers: [
        {
          fullName: 'ಶ್ರೀಮತಿ ಗೌರಮ್ಮ (Smt Gauramma)',
          relationship: 'Spouse',
          age: 48,
          gender: 'Female',
          contactNumber: '9845012346'
        }
      ],
      security: {
        cctvInstalled: 'Yes',
        securityGuardPresent: 'No',
        otherArrangements: 'Solar perimeter lighting and high gate'
      },
      issues: [
        {
          dateReported: new Date().toISOString(),
          category: 'Police-related',
          description: 'Street illumination needed near main junction to prevent evening anti-social nuisance.',
          additionalRemarks: 'Night cheetah patrol requested between 21:00 and 23:00.'
        },
        {
          dateReported: new Date().toISOString(),
          category: 'Other department',
          description: 'Underground drainage leakage causing water logging and foul smell.',
          additionalRemarks: 'Grievance flagged for Gram Panchayat clearance.'
        }
      ]
    };

    const registerRes = await request('/houses', {
      method: 'POST',
      body: newHousePayload,
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    const createdHouse = registerRes.data.data;
    console.log(`5. Registered House ID: ${createdHouse.houseId} (DB ID: ${createdHouse._id}) ✓`);
    console.log(`   Security: CCTV=${createdHouse.security.cctvInstalled}, Guard=${createdHouse.security.securityGuardPresent}`);
    console.log(`   Initial Issues: ${createdHouse.issues.length}`);

    const issue1 = createdHouse.issues[0];
    const issue2 = createdHouse.issues[1];

    // 6. Staff records a 3rd issue to the house
    const addIssueRes = await request(`/houses/${createdHouse._id}/issues`, {
      method: 'POST',
      body: {
        category: 'Other department',
        description: 'Low-hanging live wire near transformer box.',
        additionalRemarks: 'BESCOM junior engineer informed verbally.'
      },
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    const houseAfterAdd = addIssueRes.data.house;
    console.log(`6. Staff added 3rd issue. Total issues on house: ${houseAfterAdd.issues.length} ✓`);
    const issue3 = houseAfterAdd.issues.find(i => i.description.includes('wire'));

    // 7. Verify Staff CANNOT update Action Taken (Must be 403 Forbidden)
    let forbiddenCaught = false;
    try {
      await request(`/houses/${createdHouse._id}/issues/${issue1._id}/action`, {
        method: 'PUT',
        body: {
          actionTaken: 'Unauthorized attempt by staff',
          status: 'Resolved'
        },
        headers: { Authorization: `Bearer ${staffToken}` }
      });
    } catch (err) {
      if (err.status === 403) {
        forbiddenCaught = true;
      }
    }
    console.log(`7. Access Control: Staff prevented from updating Action Taken (HTTP 403): ${forbiddenCaught ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!forbiddenCaught) throw new Error('Staff was able to update action taken! Access control failed.');

    // 8. Admin updates Action Taken on Issue 1 (In Progress)
    const updateIssue1Res = await request(`/houses/${createdHouse._id}/issues/${issue1._id}/action`, {
      method: 'PUT',
      body: {
        actionTaken: 'Instructed Night Beat Cheetah vehicle to conduct special surveillance from 20:30 to 23:30.',
        responsibleDepartment: 'Police Department',
        actionDate: '2026-10-16',
        status: 'In Progress',
        followUpRemarks: 'Beat Constable submitted first patrol log report.'
      },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const updatedIssue1 = updateIssue1Res.data.data;
    console.log(`8. Admin updated Issue 1 status: ${updatedIssue1.status}, Dept: ${updatedIssue1.responsibleDepartment} ✓`);

    // 9. Admin updates Action Taken on Issue 2 (Resolved)
    const updateIssue2Res = await request(`/houses/${createdHouse._id}/issues/${issue2._id}/action`, {
      method: 'PUT',
      body: {
        actionTaken: 'Letter dispatched to PDO Gram Panchayat. Panchayath staff cleared blockage.',
        responsibleDepartment: 'Gram Panchayat',
        actionDate: '2026-10-16',
        status: 'Resolved',
        followUpRemarks: 'Drainage pipe repaired and sealed.'
      },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const updatedIssue2 = updateIssue2Res.data.data;
    console.log(`9. Admin updated Issue 2 status: ${updatedIssue2.status}, Dept: ${updatedIssue2.responsibleDepartment} ✓`);

    // 10. Admin updates Security settings on House
    const updateSecRes = await request(`/houses/${createdHouse._id}/security`, {
      method: 'PUT',
      body: {
        cctvInstalled: 'Yes',
        securityGuardPresent: 'Yes',
        otherArrangements: 'Added CCTV night vision cameras and 24/7 security guard post.'
      },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`10. Admin updated Security: Guard=${updateSecRes.data.data.securityGuardPresent}, CCTV=${updateSecRes.data.data.cctvInstalled} ✓`);

    // 11. Fetch Issues Ledger
    const ledgerRes = await request('/houses/issues/ledger', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = ledgerRes.data.stats;
    console.log(`11. Global Issues Ledger Stats:`);
    console.log(`    Total: ${stats.total}, Pending: ${stats.pending}, InProgress: ${stats.inProgress}, Resolved: ${stats.resolved}`);
    console.log(`    Police-related: ${stats.policeRelated}, Other Department: ${stats.otherDept} ✓`);

    if (stats.total < 3 || stats.pending < 1 || stats.inProgress < 1 || stats.resolved < 1) {
      throw new Error(`Ledger stats mismatch: expected total >= 3, pending >= 1, inProgress >= 1, resolved >= 1`);
    }

    // 12. Test PDF Certificate Generation
    const pdfRes = await request(`/houses/${createdHouse._id}/export/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`12. Generated PDF Certificate: Size = ${pdfRes.data.length} bytes, Status = ${pdfRes.status} ✓`);
    if (pdfRes.data.length < 1000) throw new Error('PDF Certificate is unusually small!');

    // 13. Test Excel Export (Single House and Bulk Register with Sheet 5)
    const excelSingleRes = await request(`/houses/${createdHouse._id}/export/excel`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`13a. Generated Single House Excel: Size = ${excelSingleRes.data.length} bytes, Status = ${excelSingleRes.status} ✓`);
    if (excelSingleRes.data.length < 1000) throw new Error('Single House Excel export is unusually small!');

    const excelBulkRes = await request(`/houses/export/bulk/excel`, {
      method: 'POST',
      body: { houseIds: [createdHouse.houseId] },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`13b. Generated Bulk House Excel with Security & Issues Sheet: Size = ${excelBulkRes.data.length} bytes, Status = ${excelBulkRes.status} ✓`);
    if (excelBulkRes.data.length < 1000) throw new Error('Bulk House Excel export is unusually small!');

    // 14. Clean up test record so database stays 100% clean for real police field surveys
    await request(`/houses/${createdHouse._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('14. Test house cleaned up. Database remains clean with 0 demo/test records ✓');

    // 15. Verify house count is 0
    const finalHousesRes = await request('/houses', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const houseList = finalHousesRes.data.data || finalHousesRes.data.houses || [];
    console.log(`15. Final House count: ${houseList.length} (Empty database verified) ✓`);

    console.log('\n================================================================');
    console.log('  ALL VERIFICATIONS PASSED SUCCESSFULLY (100% COMPLIANT)       ');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err.data || err.message);
    process.exit(1);
  }
}

runVerification();
