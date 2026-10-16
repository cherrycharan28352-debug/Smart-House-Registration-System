const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');
const Settings = require('../models/Settings');
const Beat = require('../models/Beat');
const Village = require('../models/Village');

dotenv.config();

const seedInitialData = async () => {
  try {
    console.log('[Seeder] Initializing clean state for ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್...');

    // 1. Ensure default settings with Mane Manege Police branding
    let existingSettings = await Settings.findOne();
    if (!existingSettings) {
      existingSettings = await Settings.create({
        organizationName: 'ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ / Mane Manege Police House Survey System',
        department: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ / Karnataka State Police Administration',
        contactEmail: 'manemanegepolice@ksp.gov.in',
        contactPhone: '112',
        address: 'Police Administrative Center, Karnataka',
        defaultMapLat: 12.9716, // Karnataka central map reference
        defaultMapLng: 77.5946,
        defaultZoom: 12,
        pdfDisclaimer: 'ಸೂಚನೆ: ಈ ಸಮೀಕ್ಷಾ ವರದಿಯು "ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್" ಯೋಜನೆಯಡಿ ಸುರಕ್ಷತೆ ಮತ್ತು ಜನಗಣತಿ ಉದ್ದೇಶಕ್ಕಾಗಿ ಸಂಗ್ರಹಿಸಲಾದ ಪೊಲೀಸ್ ಆಡಳಿತಾತ್ಮಕ ದಾಖಲೆಯಾಗಿದೆ. ಇದು ಕಾನೂನುಬದ್ಧ ಆಸ್ತಿ ಹಕ್ಕು ಪತ್ರವಲ್ಲ.'
      });
      console.log('[Seeder] Police administration settings initialized.');
    }

    // 2. Ensure official police user accounts exist
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      await User.create({
        userId: 'USR-1001',
        username: 'admin',
        email: 'admin@police.karnataka.gov.in',
        password: process.env.ADMIN_PASSWORD || 'AdminPassword@2026',
        fullName: 'ನಿರ್ವಾಹಕ ಅಧಿಕಾರಿ / Police Inspector (Admin)',
        role: 'admin',
        accountStatus: 'approved'
      });
      console.log('[Seeder] Administrator account verified (admin).');
    } else if (adminUser.accountStatus === 'active') {
      adminUser.accountStatus = 'approved';
      await adminUser.save();
    }

    const existingStaff = await User.findOne({ username: 'staff' });
    if (!existingStaff) {
      await User.create({
        userId: 'STF-1002',
        username: 'staff',
        staffId: 'BEAT-OFFICER-01',
        mobileNumber: '9900011201',
        email: 'staff@police.karnataka.gov.in',
        password: process.env.STAFF_PASSWORD || 'StaffPassword@2026',
        fullName: 'ಬೀಟ್ ಪೊಲೀಸ್ ಅಧಿಕಾರಿ / Beat Officer (Staff)',
        role: 'staff',
        accountStatus: 'approved',
        assignedBeats: ['Beat 01', 'Beat 02'],
        assignedVillages: []
      });
      console.log('[Seeder] Beat staff account verified (staff - assigned to Beat 01, Beat 02).');
    } else if (existingStaff.accountStatus === 'active' || !existingStaff.assignedBeats || existingStaff.assignedBeats.length === 0) {
      existingStaff.accountStatus = 'approved';
      if (!existingStaff.assignedBeats || existingStaff.assignedBeats.length === 0) {
        existingStaff.assignedBeats = ['Beat 01', 'Beat 02'];
      }
      if (!existingStaff.staffId) {
        existingStaff.staffId = 'BEAT-OFFICER-01';
      }
      await existingStaff.save();
    }

    const existingViewer = await User.findOne({ username: 'viewer' });
    if (!existingViewer) {
      await User.create({
        userId: 'USR-1003',
        username: 'viewer',
        email: 'viewer@police.karnataka.gov.in',
        password: 'ViewerPassword@2026',
        fullName: 'ಮೇಲ್ವಿಚಾರಣಾ ಅಧಿಕಾರಿ / Station Duty Officer (Viewer)',
        role: 'viewer',
        accountStatus: 'active'
      });
      console.log('[Seeder] Station auditor account verified (viewer).');
    }

    // 3. Clear any previous demo / placeholder house registrations, owners, family, and sample villages
    const demoHouseIds = ['MMP-1001', 'MMP-1002', 'MMP-1003', 'MMP-1004', 'HR-1001', 'HR-1002', 'HR-1003', 'HR-1004', 'HR-1005'];
    const demoFound = await House.find({ houseId: { $in: demoHouseIds } });
    if (demoFound.length > 0) {
      console.log('[Seeder] Purging placeholder/demo house registrations...');
      await House.deleteMany({ houseId: { $in: demoHouseIds } });
      await Owner.deleteMany({ ownerId: { $in: ['OWN-1001', 'OWN-1002', 'OWN-1003', 'OWN-1004'] } });
      await FamilyMember.deleteMany({ memberId: { $in: ['FAM-1001', 'FAM-1002', 'FAM-1003', 'FAM-1004'] } });
    }

    // Clean up sample villages if any exist from old demo seeds
    const sampleVillageNames = [
      'Ramanagara', 'Vidyaniketan Colony', 'Gandhi Nagar', 'Gandhinagar',
      'Malleshwaram Ward', 'Vyalikaval', 'Halasuru Village', 'Indiranagar East',
      'Koramangala 4th Block', 'Jayanagar 9th Block', 'Basavanagudi', 'Chamarajpet',
      'Peenya Industrial Area', 'Dasarahalli Village', 'Kengeri Satellite Town',
      'Kumbalgodu Village', 'Nelamangala Highway Colony', 'Solur Gate',
      'Yelahanka Old Town', 'Jakkur Lake Layout', 'Whitefield Village',
      'Kadugodi Colony', 'Electronic City Phase 1', 'Hebbagodi Village'
    ];
    await Village.deleteMany({ name: { $in: sampleVillageNames } });

    // 4. Ensure exactly 11 Beats exist with clean, configurable structure
    const kannadaDigits = ['೦೧', '೦೨', '೦೩', '೦೪', '೦೫', '೦೬', '೦೭', '೦೮', '೦೯', '೧೦', '೧೧'];
    for (let i = 1; i <= 11; i++) {
      const beatNum = `Beat ${i < 10 ? '0' + i : i}`;
      const kannadaNum = kannadaDigits[i - 1];
      let beatDoc = await Beat.findOne({ beatNumber: beatNum });
      if (!beatDoc) {
        await Beat.create({
          beatNumber: beatNum,
          beatName: beatNum,
          beatNameKannada: `ಬೀಟ್ ${kannadaNum}`,
          officerName: '',
          officerContact: '',
          description: ''
        });
      } else {
        // If it had placeholder fake officer names from earlier versions, clean them
        if (beatDoc.officerName?.includes('Badge') || beatDoc.officerName?.includes('Head Constable / Beat Officer')) {
          beatDoc.officerName = '';
          beatDoc.officerContact = '';
          beatDoc.description = '';
          await beatDoc.save();
        }
      }
    }
    // 5. Import official 11 Beats and 152 Kannada Villages from reference records
    const { importOfficialVillages } = require('./importOfficialVillages');
    await importOfficialVillages();

    console.log('[Seeder] Clean database state ready with official villages and 0 demo houses.');
  } catch (err) {
    console.error('[Seeder] Error during initialization:', err.message);
  }
};

module.exports = { seedInitialData };
