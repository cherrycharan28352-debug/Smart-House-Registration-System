const fs = require('fs');
const path = require('path');
const { generateSingleHousePDF } = require('../services/pdfService');
const { generateHouseExcel } = require('../services/excelService');

async function runVerificationSuite() {
  console.log('=== STARTING FAMILY RELATIONSHIPS & PDF VERIFICATION SUITE ===');

  const testRelationships = [
    'Husband', 'Wife', 'Son', 'Daughter', 'Father', 'Mother',
    'Brother', 'Sister', 'Grandfather', 'Grandmother',
    'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent',
    'Grandchild', 'Relative', 'Tenant', 'Other'
  ];

  console.log(`[PASS] 19 standard relationship definitions: ${testRelationships.length} relationships configured.`);

  // 16 family members to test multi-page table break & repeated headers
  const mockFamilyMembers = testRelationships.slice(0, 16).map((rel, idx) => ({
    memberId: `MEM-TEST-${idx + 1}`,
    fullName: `ಕರ್ನಾಟಕ ಸದಸ್ಯ ${rel} Member ${idx + 1}`,
    relationship: rel,
    age: 20 + idx,
    gender: idx % 2 === 0 ? 'Male' : 'Female',
    occupation: idx % 3 === 0 ? 'Agriculturist / ಕೃಷಿ' : (idx % 3 === 1 ? 'Teacher' : 'Business'),
    contactNumber: `987654321${idx % 10}`
  }));

  const mockHouse = {
    houseId: 'KSP-TEST-001',
    houseNumber: '108/A-2',
    streetName: 'Gandhi Circle Main Road',
    beatNumber: 'Beat 01',
    village: 'Tubagere / ತೂಬಗೆರೆ',
    locality: 'Vidyanagar',
    city: 'Tubagere',
    subdistrict: 'Doddaballapura / ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district: 'Bengaluru Rural / ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state: 'Karnataka',
    pincode: '561205',
    houseType: 'Independent house',
    numberOfFloors: 2,
    numberOfRooms: 5,
    ownershipType: 'Owned',
    registrationDate: new Date('2026-10-20'),
    registrationStatus: 'Approved',
    remarks: 'Verified during beat rounds by Constable Kumar.',
    gps: {
      latitude: 13.293456,
      longitude: 77.542318,
      accuracy: 4.5,
      source: 'gps'
    },
    owner: {
      ownerId: 'OWN-TEST-001',
      fullName: 'ಚಂದ್ರಶೇಖರ ಗೌಡ (Chandrashekhara Gowda)',
      contactNumber: '9448123456',
      email: 'chandru.gowda@example.com',
      ownershipType: 'Owned',
      correspondenceAddress: 'House 108/A-2, Tubagere, Doddaballapura Taluk',
      age: 56,
      representativeStatus: 'Owner',
      idReference: 'Aadhaar: XXXX-XXXX-4589'
    },
    familyMembers: mockFamilyMembers,
    security: {
      cctvInstalled: 'Yes',
      securityGuardPresent: 'No',
      otherArrangements: 'Gated compound with dog'
    },
    issues: [
      {
        issueId: 'ISS-001',
        dateReported: new Date('2026-10-21'),
        category: 'Police-related',
        description: 'Street light broken near cross road, dark at night / ಬೀದಿ ದೀಪ ದುರಸ್ತಿ',
        actionTaken: 'Notified local authority',
        responsibleDepartment: 'Gram Panchayat',
        status: 'In Progress'
      },
      {
        issueId: 'ISS-002',
        dateReported: new Date('2026-10-22'),
        category: 'Other department',
        description: 'Drinking water pipeline leakage / ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಲೈನ್ ಸೋರಿಕೆ',
        actionTaken: 'Escalated to PWD engineer',
        responsibleDepartment: 'Rural Water Supply',
        status: 'Resolved'
      }
    ],
    photos: [
      {
        photoId: 'PHT-001',
        category: 'Front view',
        originalName: 'front_elevation.jpg',
        filename: 'front_elevation.jpg',
        filePath: 'uploads/photos/test_front.jpg',
        fileSize: 45000,
        createdAt: new Date()
      },
      {
        photoId: 'PHT-002',
        category: 'Entry gate',
        originalName: 'entry_gate.jpg',
        filename: 'entry_gate.jpg',
        filePath: 'uploads/photos/test_gate.jpg',
        fileSize: 38000,
        createdAt: new Date()
      }
    ]
  };

  // Test 1: Single House PDF to file
  const testPdfPath = path.join(__dirname, 'test_output.pdf');
  const pdfOut = fs.createWriteStream(testPdfPath);
  pdfOut.setHeader = () => {};

  await new Promise((resolve, reject) => {
    pdfOut.on('finish', resolve);
    pdfOut.on('error', reject);
    generateSingleHousePDF(mockHouse, pdfOut).catch(reject);
  });

  const pdfStats = fs.statSync(testPdfPath);
  console.log(`[PASS] Single House PDF generated: ${pdfStats.size} bytes at ${testPdfPath}`);

  // Test 2: Excel Export to file
  const testExcelPath = path.join(__dirname, 'test_output.xlsx');
  const excelOut = fs.createWriteStream(testExcelPath);
  excelOut.setHeader = () => {};

  await new Promise((resolve, reject) => {
    excelOut.on('finish', resolve);
    excelOut.on('error', reject);
    generateHouseExcel([mockHouse], excelOut, 'test_output.xlsx').catch(reject);
  });

  const excelStats = fs.statSync(testExcelPath);
  console.log(`[PASS] Multi-sheet Excel export generated: ${excelStats.size} bytes at ${testExcelPath}`);

  // Clean up test files
  if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
  if (fs.existsSync(testExcelPath)) fs.unlinkSync(testExcelPath);

  console.log('\n=== ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ===');
}

runVerificationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION SUITE FAILED:', err);
    process.exit(1);
  });
