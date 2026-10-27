const mongoose = require('mongoose');
const FamilyMember = require('../models/FamilyMember');
const House = require('../models/House');
const Owner = require('../models/Owner');

async function testFamilySyncOffline() {
  console.log('=== TESTING FAMILY MEMBER SCHEMA INTEGRITY OFFLINE ===');

  const testRelationships = [
    'Husband', 'Wife', 'Son', 'Daughter', 'Father', 'Mother',
    'Brother', 'Sister', 'Grandfather', 'Grandmother',
    'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent',
    'Grandchild', 'Relative', 'Tenant', 'Other',
    'ಗಂಡ', 'ಹೆಂಡತಿ', 'ಮಗ', 'ಮಗಳು', 'ತಂದೆ', 'ತಾಯಿ', 'ಅಜ್ಜ', 'ಅಜ್ಜಿ'
  ];

  const dummyHouseId = new mongoose.Types.ObjectId();

  for (const rel of testRelationships) {
    const memberDoc = new FamilyMember({
      memberId: 'MEM-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      house: dummyHouseId,
      fullName: 'Test Member ' + rel,
      relationship: rel,
      age: 32,
      gender: 'Male',
      occupation: 'Police Sub-Inspector',
      contactNumber: '9988776655'
    });

    const validationErr = memberDoc.validateSync();
    if (validationErr) {
      throw new Error(`Validation failed for relationship "${rel}": ` + validationErr.message);
    }
  }

  console.log(`[PASS] All ${testRelationships.length} relationship variations passed Mongoose schema validation.`);
  console.log('=== OFFLINE SCHEMA INTEGRITY TEST PASSED! ===');
}

testFamilySyncOffline()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
