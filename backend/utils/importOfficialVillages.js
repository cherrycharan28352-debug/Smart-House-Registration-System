const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Beat = require('../models/Beat');
const Village = require('../models/Village');
const { OFFICIAL_BEATS_DATA } = require('../data/officialBeatsAndVillages');
const { connectDB } = require('../config/db');

dotenv.config();

/**
 * Idempotent import of official Karnataka Police 11 Beats and 152 Villages.
 * Safe to run multiple times without duplicating villages or deleting existing real data.
 */
const importOfficialVillages = async () => {
  console.log('------------------------------------------------------------');
  console.log('[Importer] Starting idempotent import of official Beats & Villages...');
  console.log('------------------------------------------------------------');

  let totalBeatsConfigured = 0;
  let totalVillagesProcessed = 0;
  let newVillagesAdded = 0;
  let existingVillagesUpdated = 0;

  for (const beatData of OFFICIAL_BEATS_DATA) {
    // 1. Ensure Beat document exists with proper Kannada name
    let beatDoc = await Beat.findOne({
      beatNumber: new RegExp(`^${beatData.beatNumber}$`, 'i')
    });

    if (!beatDoc) {
      beatDoc = await Beat.create({
        beatNumber: beatData.beatNumber,
        beatName: beatData.beatName || beatData.beatNumber,
        beatNameKannada: beatData.beatNameKannada || beatData.beatNumber,
        officerName: '',
        officerContact: '',
        description: ''
      });
      console.log(`[Importer] Created Beat: ${beatDoc.beatNumber} (${beatDoc.beatNameKannada})`);
    } else {
      if (!beatDoc.beatNameKannada || beatDoc.beatNameKannada === beatDoc.beatNumber) {
        beatDoc.beatNameKannada = beatData.beatNameKannada;
        await beatDoc.save();
      }
    }
    totalBeatsConfigured++;

    // 2. Process each village for this Beat
    for (const v of beatData.villages) {
      totalVillagesProcessed++;

      // Idempotency check: Look for existing village in this beat by villageId, Kannada name, or name
      let existingVillage = await Village.findOne({
        beatNumber: beatDoc.beatNumber,
        $or: [
          { villageId: v.id },
          { name: v.name },
          { nameKannada: v.nameKannada }
        ]
      });

      if (!existingVillage) {
        // Also check if villageId was previously generated with old timestamp pattern
        existingVillage = await Village.findOne({
          beatNumber: beatDoc.beatNumber,
          $or: [{ name: v.name }, { nameKannada: v.nameKannada }]
        });
      }

      if (existingVillage) {
        // Update database relationship and canonical IDs while preserving user modifications
        let changed = false;

        if (!existingVillage.beatRef || existingVillage.beatRef.toString() !== beatDoc._id.toString()) {
          existingVillage.beatRef = beatDoc._id;
          changed = true;
        }

        if (!existingVillage.villageId) {
          existingVillage.villageId = v.id;
          changed = true;
        }

        if (!existingVillage.nameKannada) {
          existingVillage.nameKannada = v.nameKannada;
          changed = true;
        }

        if (!existingVillage.taluk) {
          existingVillage.taluk = 'ದೊಡ್ಡಬಳ್ಳಾಪುರ';
          changed = true;
        }

        if (!existingVillage.district) {
          existingVillage.district = 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ';
          changed = true;
        }

        if (changed) {
          await existingVillage.save();
          existingVillagesUpdated++;
        }
      } else {
        // Create new official village
        await Village.create({
          villageId: v.id,
          name: v.name,
          nameKannada: v.nameKannada,
          beatNumber: beatDoc.beatNumber,
          beatRef: beatDoc._id,
          taluk: 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
          district: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
          state: 'Karnataka',
          pincode: '',
          landmark: ''
        });
        newVillagesAdded++;
      }
    }
  }

  console.log('------------------------------------------------------------');
  console.log(`[Importer] Import completed successfully:`);
  console.log(`  - 11 Beats verified: ${totalBeatsConfigured}`);
  console.log(`  - Total official villages processed: ${totalVillagesProcessed}`);
  console.log(`  - New villages added: ${newVillagesAdded}`);
  console.log(`  - Existing villages linked/updated: ${existingVillagesUpdated}`);
  console.log('------------------------------------------------------------');

  return {
    beatsCount: totalBeatsConfigured,
    totalVillages: totalVillagesProcessed,
    newVillagesAdded,
    existingVillagesUpdated
  };
};

// If run directly from CLI: node backend/utils/importOfficialVillages.js
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await importOfficialVillages();
      process.exit(0);
    } catch (err) {
      console.error('[Importer Error]:', err);
      process.exit(1);
    }
  })();
}

module.exports = { importOfficialVillages };
