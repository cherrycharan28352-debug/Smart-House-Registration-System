const House = require('../models/House');
const { generateSingleHousePDF, generateBulkHousePDF } = require('../services/pdfService');
const { generateHouseExcel } = require('../services/excelService');

// Helper to populate complete house model
const getPopulatedHouses = async (queryFilter) => {
  return House.find(queryFilter)
    .populate('owner')
    .populate('familyMembers')
    .populate('photos')
    .populate('registeredBy', 'fullName username role')
    .sort({ houseId: 1 });
};

// @desc    Export single house registration as PDF
// @route   GET /api/houses/:id/export/pdf
// @access  Private
exports.exportSingleHousePDF = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      house = await House.findById(id);
    }
    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }

    if (!house) {
      return res.status(404).json({ success: false, message: 'House registration not found.' });
    }

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = (req.user.assignedBeats || []).map((b) => b.trim().toLowerCase());
      if (!assignedBeats.includes((house.beatNumber || '').trim().toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You cannot export house records outside your assigned beat jurisdiction.'
        });
      }
    }

    await house.populate([
      { path: 'owner' },
      { path: 'familyMembers' },
      { path: 'photos' },
      { path: 'registeredBy', select: 'fullName username role' }
    ]);

    await generateSingleHousePDF(house, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Export single house registration as Excel
// @route   GET /api/houses/:id/export/excel
// @access  Private
exports.exportSingleHouseExcel = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      house = await House.findById(id);
    }
    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }

    if (!house) {
      return res.status(404).json({ success: false, message: 'House registration not found.' });
    }

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = (req.user.assignedBeats || []).map((b) => b.trim().toLowerCase());
      if (!assignedBeats.includes((house.beatNumber || '').trim().toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You cannot export house records outside your assigned beat jurisdiction.'
        });
      }
    }

    await house.populate([
      { path: 'owner' },
      { path: 'familyMembers' },
      { path: 'photos' }
    ]);

    const filename = `House_Registration_${house.houseId || 'Report'}.xlsx`;
    await generateHouseExcel([house], res, filename);
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk Export selected houses as combined PDF
// @route   POST /api/houses/export/bulk/pdf
// @access  Private
exports.exportBulkPDF = async (req, res, next) => {
  try {
    const { houseIds } = req.body;

    let filter = {};
    if (Array.isArray(houseIds) && houseIds.length > 0) {
      const isObjectId = houseIds[0].match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        filter = { _id: { $in: houseIds } };
      } else {
        filter = { houseId: { $in: houseIds } };
      }
    } else {
      filter = {};
    }

    // Staff jurisdiction enforcement on bulk export
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: No beats are assigned to your staff account.'
        });
      }
      filter.beatNumber = { $in: assignedBeats };
      if (req.user.assignedVillages && req.user.assignedVillages.length > 0) {
        filter.village = { $in: req.user.assignedVillages };
      }
    }

    const houses = await getPopulatedHouses(filter);

    if (houses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching house records found for export in your authorized jurisdiction.'
      });
    }

    // Limit maximum bulk export to 100 for performance and reliability
    const exportBatch = houses.slice(0, 100);
    await generateBulkHousePDF(exportBatch, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk Export selected houses as 4-sheet Excel workbook
// @route   POST /api/houses/export/bulk/excel
// @access  Private
exports.exportBulkExcel = async (req, res, next) => {
  try {
    const { houseIds } = req.body;

    let filter = {};
    if (Array.isArray(houseIds) && houseIds.length > 0) {
      const isObjectId = houseIds[0].match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        filter = { _id: { $in: houseIds } };
      } else {
        filter = { houseId: { $in: houseIds } };
      }
    } else {
      filter = {};
    }

    // Staff jurisdiction enforcement on bulk export
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: No beats are assigned to your staff account.'
        });
      }
      filter.beatNumber = { $in: assignedBeats };
      if (req.user.assignedVillages && req.user.assignedVillages.length > 0) {
        filter.village = { $in: req.user.assignedVillages };
      }
    }

    const houses = await getPopulatedHouses(filter);

    if (houses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching house records found for export in your authorized jurisdiction.'
      });
    }

    const exportBatch = houses.slice(0, 250);
    const filename = `House_Registrations_Bulk_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await generateHouseExcel(exportBatch, res, filename);
  } catch (err) {
    next(err);
  }
};
