const Owner = require('../models/Owner');
const House = require('../models/House');
const { generateOwnerId } = require('../utils/idGenerator');

// @desc    Get owner for a house
// @route   GET /api/houses/:id/owner
// @access  Private
exports.getOwnerByHouseId = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = (req.user.assignedBeats || []).map((b) => b.trim().toLowerCase());
      if (!assignedBeats.includes((house.beatNumber || '').trim().toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You cannot view owner records for houses outside your assigned beat jurisdiction.'
        });
      }
    }

    const owner = await Owner.findOne({ house: house._id });
    if (!owner) {
      return res.status(404).json({ success: false, message: 'No owner recorded for this house.' });
    }

    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update owner for a house
// @route   PUT /api/houses/:id/owner
// @access  Private
exports.updateOwnerByHouseId = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = (req.user.assignedBeats || []).map((b) => b.trim().toLowerCase());
      if (!assignedBeats.includes((house.beatNumber || '').trim().toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You cannot modify owner records for houses outside your assigned beat jurisdiction.'
        });
      }
    }

    const {
      fullName,
      contactNumber,
      email,
      ownershipType,
      correspondenceAddress,
      age,
      idReference
    } = req.body;

    if (!fullName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Owner full name and contact number are required.'
      });
    }

    let owner = await Owner.findOne({ house: house._id });

    if (owner) {
      owner.fullName = fullName;
      owner.contactNumber = contactNumber;
      if (email !== undefined) owner.email = email;
      if (ownershipType) owner.ownershipType = ownershipType;
      if (correspondenceAddress !== undefined) owner.correspondenceAddress = correspondenceAddress;
      if (age !== undefined) owner.age = age ? Number(age) : undefined;
      if (idReference !== undefined) owner.idReference = idReference;
      await owner.save();
    } else {
      const ownerId = await generateOwnerId();
      owner = new Owner({
        ownerId,
        house: house._id,
        fullName,
        contactNumber,
        email: email || '',
        ownershipType: ownershipType || house.ownershipType,
        correspondenceAddress: correspondenceAddress || '',
        age: age ? Number(age) : undefined,
        idReference: idReference || ''
      });
      await owner.save();
      house.owner = owner._id;
      await house.save();
    }

    res.status(200).json({
      success: true,
      message: 'Owner information updated successfully.',
      data: owner
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all owners with search, filter, and pagination (for Owners Page)
// @route   GET /api/owners
// @access  Private
exports.getAllOwners = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', ownershipType = '' } = req.query;
    const query = {};

    // Role-based staff restriction
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit, totalPages: 0 }
        });
      }
      const staffHouses = await House.find({ beatNumber: { $in: assignedBeats } }).select('_id');
      query.house = { $in: staffHouses.map((h) => h._id) };
    }

    if (ownershipType) {
      query.ownershipType = ownershipType;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { contactNumber: regex }, { email: regex }, { ownerId: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Owner.countDocuments(query);
    const owners = await Owner.find(query)
      .populate('house', 'houseId houseNumber streetName locality city houseType beatNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: owners,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};
