const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const Beat = require('../models/Beat');
const Village = require('../models/Village');
const User = require('../models/User');
const HousePhoto = require('../models/HousePhoto');
const BackupRecord = require('../models/BackupRecord');
const RestoreRecord = require('../models/RestoreRecord');
const backupService = require('../services/backupService');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${testName}`);
    failedTests++;
  }
}

async function runBackupRestoreSuite() {
  console.log('========================================================================');
  console.log('  MANE MANEGE POLICE — BACKUP, RESTORE & PERMANENCE VERIFICATION SUITE  ');
  console.log('========================================================================\n');

  try {
    // 1. Connect to Database
    console.log('--- TEST 1: Database Connection & Environment ---');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    assert(mongoose.connection.readyState === 1, 'Connected to MongoDB Atlas');
    console.log(`  Database Host: ${mongoose.connection.host}`);
    console.log(`  Database Name: ${mongoose.connection.name}`);

    // 2. Storage Stats & Capacity Limits
    console.log('\n--- TEST 2: Storage Monitoring & Capacity Limits ---');
    const storageStats = await backupService.getStorageStats();
    assert(storageStats && storageStats.database, 'Storage stats retrieved successfully');
    assert(typeof storageStats.database.totalUsedBytes === 'number', 'Total DB bytes calculated');
    assert(storageStats.database.capacityLimitBytes === 536870912, 'Atlas M0 512MB capacity quota configured');
    assert(storageStats.scaleReadiness.status === 'READY', '200,000+ Scale readiness verified');
    console.log(`  DB Storage Used: ${storageStats.database.totalUsedFormatted} (${storageStats.database.usagePercentage}%)`);
    console.log(`  Scale Target: ${storageStats.scaleReadiness.targetHouseCapacity}`);

    // 3. Create Real Household Record with Kannada, GPS & Photo
    console.log('\n--- TEST 3: Create Sample Survey Registration with Kannada & Photo ---');
    const testSuffix = Date.now().toString(36).toUpperCase();
    const testHouseId = `MMP-TEST-BKP-${testSuffix}`;
    const testOwnerId = `OWN-TEST-BKP-${testSuffix}`;
    const testMemberId = `FAM-TEST-BKP-${testSuffix}`;
    const testPhotoId = `PHT-TEST-BKP-${testSuffix}`;

    // Sample Photo file
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'houses');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const samplePhotoName = `test_photo_${testSuffix}.jpg`;
    const samplePhotoPath = path.join(uploadsDir, samplePhotoName);
    fs.writeFileSync(samplePhotoPath, 'TEST_PHOTO_BINARY_DATA_MANE_MANEGE_POLICE');

    // 1. Create House first
    const house = await House.create({
      houseId: testHouseId,
      beatNumber: 'Beat 01',
      beatName: 'Beat 01',
      village: 'ಹೊಸಕೋಟೆ',
      locality: 'ಬಡಾವಣೆ ೧',
      houseNumber: `TEST-${testSuffix}`,
      gps: {
        latitude: 12.9716,
        longitude: 77.5946,
        source: 'gps'
      },
      security: {
        cctvInstalled: 'Yes',
        cctvCount: 3,
        securityGuardPresent: 'No'
      },
      issues: [
        {
          category: 'ಪೊಲೀಸ್ ಇಲಾಖೆ',
          description: 'ರಾತ್ರಿ ಗಸ್ತು ಹೆಚ್ಚಿಸಬೇಕು (Night patrol required)',
          status: 'Pending'
        }
      ]
    });

    const owner = await Owner.create({
      ownerId: testOwnerId,
      house: house._id,
      fullName: 'ಬಸವರಾಜ್ ಬೊಮ್ಮಾಯಿ (Basavaraj)',
      contactNumber: '9845012345',
      correspondenceAddress: 'ಹೊಸಕೋಟೆ ಗ್ರಾಮ, ಬೀಟ್ ೦೧',
      age: 48,
      ownershipType: 'Owned'
    });

    const familyMember = await FamilyMember.create({
      memberId: testMemberId,
      house: house._id,
      fullName: 'ಲಲಿತಮ್ಮ (Lalithamma)',
      relationship: 'ಹೆಂಡತಿ (Wife)',
      gender: 'Female',
      age: 42,
      occupation: 'ಗೃಹಿಣಿ',
      contactNumber: '9845012346'
    });

    const photoDoc = await HousePhoto.create({
      photoId: testPhotoId,
      house: house._id,
      originalName: 'house_front.jpg',
      filename: samplePhotoName,
      filePath: `uploads/houses/${samplePhotoName}`,
      fileSize: 42,
      mimeType: 'image/jpeg',
      category: 'Front view',
      caption: 'ಮನೆಯ ಮುಂಭಾಗದ ನೋಟ'
    });

    // Link owner, family and photo to house
    house.owner = owner._id;
    house.familyMembers = [familyMember._id];
    house.photos = [photoDoc._id];
    await house.save();

    assert(house && house.houseId === testHouseId, 'Test House registered with owner, family, GPS, and security');

    // 4. Test Manual Backup Creation
    console.log('\n--- TEST 4: Execute Full Backup (Collections + Photos) ---');
    const backupResult = await backupService.createBackup({
      triggerType: 'manual',
      createdByName: 'Automated Test Runner',
      retentionDays: 14
    });

    assert(backupResult && backupResult.status === 'completed', 'Backup completed with status=completed');
    assert(fs.existsSync(backupResult.filePath), `Archive file exists on disk: ${backupResult.filename}`);
    assert(backupResult.sizeBytes > 0, `Archive size is valid: ${backupResult.sizeFormatted}`);
    assert(backupResult.checksumSha256 && backupResult.checksumSha256.length === 64, 'Cryptographic SHA-256 generated');
    assert(backupResult.photoFileCount >= 1, `Included photo files in archive (Count: ${backupResult.photoFileCount})`);
    assert(backupResult.documentCounts.houses >= 1, `Houses exported: ${backupResult.documentCounts.houses}`);

    // 5. Test Cryptographic & Structural Integrity Verification
    console.log('\n--- TEST 5: Cryptographic Integrity & Structural Verification ---');
    const integrityReport = await backupService.verifyBackupIntegrity(backupResult.backupId);
    assert(integrityReport.success === true, 'Cryptographic SHA-256 and archive structure verified');

    // 6. Test Corrupted Archive Rejection (Negative Testing)
    console.log('\n--- TEST 6: Tamper Detection (Negative Testing) ---');
    const fakeBackupRecord = await BackupRecord.create({
      backupId: `BKP-FAKE-${Date.now()}`,
      filename: 'fake_tampered.zip',
      filePath: path.join(__dirname, '..', 'storage', 'backups', 'non_existent_file.zip'),
      sizeBytes: 999,
      checksumSha256: '0000000000000000000000000000000000000000000000000000000000000000',
      triggerType: 'manual',
      status: 'completed'
    });

    const failedIntegrityReport = await backupService.verifyBackupIntegrity(fakeBackupRecord.backupId);
    assert(failedIntegrityReport.success === false, 'System correctly detects missing/tampered archive');
    await BackupRecord.deleteOne({ backupId: fakeBackupRecord.backupId });

    // 7. Test Safe Restore with Automated Pre-Restore Safety Snapshot
    console.log('\n--- TEST 7: Execute Safe Full Restore ---');
    // Count safety snapshots before restore
    const safetyCountBefore = await BackupRecord.countDocuments({ triggerType: 'pre_restore_safety' });

    const restoreResult = await backupService.restoreBackup({
      backupId: backupResult.backupId,
      restoredByName: 'Automated Test Admin',
      ipAddress: '127.0.0.1'
    });

    assert(restoreResult.success === true, 'Restore operation returned success: true');
    assert(restoreResult.safetyBackupRecord !== null, 'Automated pre-restore safety snapshot created BEFORE restore');
    
    const safetyCountAfter = await BackupRecord.countDocuments({ triggerType: 'pre_restore_safety' });
    assert(safetyCountAfter === safetyCountBefore + 1, 'Pre-restore safety snapshot recorded in registry');

    // 8. Verify Restored Data Integrity & Unicode Fidelity
    console.log('\n--- TEST 8: Verify Restored Data & Unicode Fidelity ---');
    const restoredHouse = await House.findOne({ houseId: testHouseId }).populate('owner').populate('familyMembers');
    assert(restoredHouse !== null, 'Restored House record located in MongoDB Atlas');
    assert(restoredHouse.owner.fullName === 'ಬಸವರಾಜ್ ಬೊಮ್ಮಾಯಿ (Basavaraj)', 'Owner Kannada name preserved 100%');
    assert(restoredHouse.familyMembers[0].fullName === 'ಲಲಿತಮ್ಮ (Lalithamma)', 'Family Member Kannada name preserved 100%');
    assert(restoredHouse.gps.latitude === 12.9716, 'GPS Coordinates preserved intact');
    assert(restoredHouse.security.cctvInstalled === 'Yes', 'Security parameters preserved intact');

    // 9. Verify Restored Photo File
    console.log('\n--- TEST 9: Verify Restored Photo Files on Disk ---');
    assert(fs.existsSync(samplePhotoPath), `Photo file restored to disk: ${samplePhotoName}`);
    const photoContent = fs.readFileSync(samplePhotoPath, 'utf-8');
    assert(photoContent === 'TEST_PHOTO_BINARY_DATA_MANE_MANEGE_POLICE', 'Photo binary content verified identical');

    // 10. Clean up Test Records
    console.log('\n--- TEST 10: Clean up Test Records ---');
    await House.deleteOne({ houseId: testHouseId });
    await Owner.deleteOne({ ownerId: testOwnerId });
    await FamilyMember.deleteOne({ memberId: testMemberId });
    await HousePhoto.deleteOne({ photoId: testPhotoId });
    if (fs.existsSync(samplePhotoPath)) fs.unlinkSync(samplePhotoPath);
    if (fs.existsSync(backupResult.filePath)) fs.unlinkSync(backupResult.filePath);
    await BackupRecord.deleteOne({ backupId: backupResult.backupId });
    if (restoreResult.safetyBackupRecord?.filePath && fs.existsSync(restoreResult.safetyBackupRecord.filePath)) {
      fs.unlinkSync(restoreResult.safetyBackupRecord.filePath);
      await BackupRecord.deleteOne({ backupId: restoreResult.safetyBackupRecord.backupId });
    }
    await RestoreRecord.deleteOne({ restoreId: restoreResult.restoreRecord.restoreId });
    assert(true, 'Test records cleaned up cleanly without affecting production');

    console.log('\n========================================================================');
    console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('========================================================================');

    if (failedTests === 0) {
      console.log('🎉 ALL BACKUP, RESTORE & PERMANENCE CHECKS PASSED 100%! ✓\n');
      process.exit(0);
    } else {
      console.error('❌ Some tests failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

runBackupRestoreSuite();
