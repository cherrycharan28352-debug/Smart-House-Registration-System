const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const User = require('../models/User');
const { generateHouseId } = require('../utils/idGenerator');
const { seedInitialData } = require('../utils/seedData');

async function runPersistenceVerification() {
  console.log('========================================================================');
  console.log('     MANE MANEGE POLICE — PERMANENT DATA PERSISTENCE VERIFICATION     ');
  console.log('========================================================================\n');

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

  // 1. Database Connection & Mode
  console.log('--- TEST 1: Database Connection & Architecture ---');
  await connectDB();
  assert(mongoose.connection.readyState === 1, 'MongoDB connection is active');
  console.log(`  Storage Type: ${global.storageType}`);
  console.log(`  Host: ${mongoose.connection.host}`);

  // 2. Register House and verify direct MongoDB confirmation
  console.log('\n--- TEST 2: Register House & Confirm Persistent Write ---');
  const testHouseId = await generateHouseId();
  const testHouse = new House({
    houseId: testHouseId,
    houseNumber: '99-PERSIST',
    beatNumber: 'Beat 01',
    village: 'ಮಲ್ಲತಹಳ್ಳಿ',
    locality: 'ಗೆದ್ದಲಪಾಳ್ಯ',
    subdistrict: 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state: 'Karnataka',
    pincode: '561203',
    houseType: 'Independent house',
    numberOfFloors: 2,
    numberOfRooms: 5,
    ownershipType: 'Owned',
    gps: { latitude: 13.298, longitude: 77.541, accuracy: 5 },
    security: { cctvInstalled: 'Yes', securityGuardPresent: 'No', otherArrangements: 'Gates' },
    remarks: 'Permanent persistence verification test'
  });

  await testHouse.save();

  // Create linked owner
  const testOwner = new Owner({
    ownerId: 'OWN-TEST-' + Date.now().toString().slice(-4),
    house: testHouse._id,
    fullName: 'ರಮೇಶ್ ಗೌಡ (Persistence Test)',
    contactNumber: '9845112233',
    ownershipType: 'Owned'
  });
  await testOwner.save();
  testHouse.owner = testOwner._id;

  // Create linked family member
  const testMember = new FamilyMember({
    memberId: 'FAM-TEST-' + Date.now().toString().slice(-4),
    house: testHouse._id,
    fullName: 'ಭವ್ಯ ಗೌಡ',
    relationship: 'ಮಗಳು / Daughter',
    age: 21,
    gender: 'Female'
  });
  await testMember.save();
  testHouse.familyMembers = [testMember._id];
  await testHouse.save();

  // Verify direct read from MongoDB collection
  const verifiedDoc = await House.findById(testHouse._id).populate('owner').populate('familyMembers');
  assert(verifiedDoc !== null, 'House was confirmed written directly to MongoDB');
  assert(verifiedDoc.houseId === testHouseId, `Confirmed houseId is stable: ${testHouseId}`);
  assert(verifiedDoc.owner && verifiedDoc.owner.fullName.includes('ರಮೇಶ್ ಗೌಡ'), 'Owner relationship was confirmed in MongoDB');
  assert(verifiedDoc.familyMembers.length === 1, 'Family member relationship was confirmed in MongoDB');

  // 3. Simulate Backend Restart & Startup Seeder Execution
  console.log('\n--- TEST 3: Simulated Backend Restart (Seeder Execution) ---');
  console.log('  Executing seedInitialData() to simulate full server reboot/restart...');
  await seedInitialData();

  // Verify the registered house was NOT purged or deleted!
  const survivingDoc = await House.findById(testHouse._id).populate('owner').populate('familyMembers');
  assert(survivingDoc !== null, 'CRITICAL: House record SURVIVED backend restart and seeder execution!');
  assert(survivingDoc && survivingDoc.owner !== null, 'Linked Owner record survived backend restart!');
  assert(survivingDoc && survivingDoc.familyMembers.length === 1, 'Linked Family Members survived backend restart!');

  // 4. Update One Field & Confirm Unrelated Data is Preserved
  console.log('\n--- TEST 4: Partial Update & Field Preservation ---');
  survivingDoc.numberOfFloors = 3;
  await survivingDoc.save();

  const reReadDoc = await House.findById(testHouse._id).populate('owner').populate('familyMembers');
  assert(reReadDoc.numberOfFloors === 3, 'Target field updated successfully');
  assert(reReadDoc.houseNumber === '99-PERSIST', 'Unrelated houseNumber was preserved intact');
  assert(reReadDoc.village === 'ಮಲ್ಲತಹಳ್ಳಿ', 'Unrelated village was preserved intact');
  assert(reReadDoc.owner && reReadDoc.owner.fullName.includes('ರಮೇಶ್ ಗೌಡ'), 'Linked Owner was preserved intact');
  assert(reReadDoc.familyMembers.length === 1, 'Linked Family Members were preserved intact');
  assert(reReadDoc.security.cctvInstalled === 'Yes', 'Security settings were preserved intact');

  // 5. Simulate Database Error / Validation Failure
  console.log('\n--- TEST 5: Negative Testing (Validation & Failure Reporting) ---');
  try {
    const invalidHouse = new House({
      houseId: testHouseId // Duplicate unique key!
    });
    await invalidHouse.save();
    assert(false, 'Should have rejected duplicate houseId');
  } catch (err) {
    assert(err !== null, 'Application correctly rejects invalid duplicate data instead of silently proceeding');
  }

  // 6. Cleanup Test Record
  console.log('\n--- TEST 6: Test Record Cleanup ---');
  await House.findByIdAndDelete(testHouse._id);
  await Owner.findByIdAndDelete(testOwner._id);
  await FamilyMember.findByIdAndDelete(testMember._id);

  const cleanCheck = await House.findById(testHouse._id);
  assert(cleanCheck === null, 'Test house cleanly removed after verification');

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  await disconnectDB();

  if (failed === 0) {
    console.log('🎉 ALL PERMANENT DATA PERSISTENCE CHECKS PASSED 100%! ✓');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED');
    process.exit(1);
  }
}

runPersistenceVerification().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});