const fs = require('fs');
const path = require('path');
const { generateSingleHousePDF, generateBulkHousePDF } = require('../services/pdfService');

async function testKannadaPdfGeneration() {
  console.log('========================================================================');
  console.log('       MANE MANEGE POLICE — KANNADA PDF ENCODING VERIFICATION          ');
  console.log('========================================================================\n');

  const mockRealHouse = {
    _id: '66bc10010000000000000001',
    houseId: 'HSE-KSP-001',
    houseNumber: '೪೨/ಬಿ (42/B)',
    beatNumber: 'Beat 01',
    streetName: 'ಮುಖ್ಯ ರಸ್ತೆ, ಗಣಪತಿ ದೇವಸ್ಥಾನದ ಬಳಿ (Main Road)',
    village: 'ಮಲ್ಲತಹಳ್ಳಿ',
    locality: 'ಗೆದ್ದಲಪಾಳ್ಯ',
    subdistrict: 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state: 'ಕರ್ನಾಟಕ',
    pincode: '561203',
    houseType: 'ಸ್ವತಂತ್ರ ಮನೆ / Independent House',
    numberOfFloors: 2,
    numberOfRooms: 4,
    ownershipType: 'ಸ್ವಂತ ಮನೆ / Owned',
    registrationDate: new Date('2026-10-22'),
    registrationStatus: 'Approved',
    gps: { latitude: 13.298541, longitude: 77.541258, accuracy: 4.2 },
    owner: {
      fullName: 'ರಾಮಚಂದ್ರಪ್ಪ ಗೌಡ (Ramachandrappa Gowda)',
      ownerId: 'OWN-901',
      contactNumber: '9845012345',
      email: 'ramachandra@ksp.gov.in',
      correspondenceAddress: 'ಮನೆ ನಂ ೪೨/ಬಿ, ಮಲ್ಲತಹಳ್ಳಿ ಗ್ರಾಮ, ದೊಡ್ಡಬಳ್ಳಾಪುರ ತಾಲೂಕು'
    },
    familyMembers: [
      {
        fullName: 'ಸುಮಿತ್ರಮ್ಮ ಗೌಡ (Sumithramma Gowda)',
        relationship: 'ಪತ್ನಿ / Wife',
        age: 48,
        gender: 'Female',
        occupation: 'ಗೃಹಿಣಿ / Homemaker',
        contactNumber: '9845012346'
      },
      {
        fullName: 'ಮಂಜುನಾಥ್ ಗೌಡ (Manjunath Gowda)',
        relationship: 'ಮಗ / Son',
        age: 26,
        gender: 'Male',
        occupation: 'ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್ / Software Engineer',
        contactNumber: '9845012347'
      }
    ],
    security: {
      cctvInstalled: 'Yes',
      securityGuardPresent: 'No',
      otherArrangements: 'ಬೀದಿ ದೀಪ ಮತ್ತು ನೆರೆಹೊರೆಯವರ ನಿಗಾ ವ್ಯವಸ್ಥೆ ಇದೆ'
    },
    issues: [
      {
        dateReported: new Date('2026-10-20'),
        category: 'ಪೊಲೀಸ್ ಬೀಟ್ ಗಸ್ತು / Police Beat Patrol',
        description: 'ರಾತ್ರಿ ವೇಳೆ ೧೧ ಗಂಟೆಯ ನಂತರ ಪೊಲೀಸ್ ಬೀಟ್ ಸಿಬ್ಬಂದಿ ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಕೋರಿಕೆ',
        actionTaken: 'ದೊಡ್ಡಬಳ್ಳಾಪುರ ಗ್ರಾಮಾಂತರ ಠಾಣಾ ಬೀಟ್ ಅಧಿಕಾರಿಗೆ ರಾತ್ರಿ ಗಸ್ತು ವಹಿಸಲಾಗಿದೆ',
        responsibleDepartment: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ / KSP',
        status: 'In Progress'
      }
    ],
    remarks: 'ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ ಸಮೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ಕುಟುಂಬದ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.'
  };

  const chunks = [];
  const mockRes = new (require('stream').Writable)({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });
  mockRes.setHeader = () => {};

  console.log('Generating single house PDF with full Kannada & English text...');
  await generateSingleHousePDF(mockRealHouse, mockRes);
  const pdfBuffer = Buffer.concat(chunks);

  const outDir = path.join(__dirname, '..', 'fonts');
  const outFile = path.join(outDir, 'Verified_Mane_Manege_Police_Survey.pdf');
  fs.writeFileSync(outFile, pdfBuffer);

  console.log(`✓ PDF Generated successfully (${pdfBuffer.length} bytes)`);
  console.log(`✓ Saved locally to: ${outFile}\n`);

  // Assertions
  const pdfString = pdfBuffer.toString('binary');
  const hasPdfHeader = pdfString.startsWith('%PDF-');
  const hasNotoFont = pdfString.includes('NotoSansKannada');
  const hasToUnicode = pdfString.includes('/ToUnicode');
  const hasFontDescriptor = pdfString.includes('/FontDescriptor');

  console.log('--- Verification Checks ---');
  console.log(`1. Valid PDF file header (%PDF): ${hasPdfHeader ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`2. Embedded Noto Sans Kannada Unicode Font: ${hasNotoFont ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`3. Embedded /ToUnicode CMap Table: ${hasToUnicode ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`4. Embedded FontDescriptor Table: ${hasFontDescriptor ? '✓ PASS' : '✗ FAIL'}`);

  if (hasPdfHeader && hasNotoFont && hasToUnicode && hasFontDescriptor) {
    console.log('\n🎉 ALL KANNADA PDF ENCODING CHECKS PASSED 100%! ✓');
    return outFile;
  } else {
    throw new Error('One or more Kannada PDF verification assertions failed!');
  }
}

testKannadaPdfGeneration().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});