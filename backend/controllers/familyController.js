const FamilyMember = require('../models/FamilyMember');
const House = require('../models/House');
const { generateMemberId } = require('../utils/idGenerator');

// @desc    Get all family members for a specific house
// @route   GET /api/houses/:id/family
// @access  Private
exports.getFamilyByHouseId = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    const members = await FamilyMember.find({ house: house._id }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

// @desc    Add family member to a house
// @route   POST /api/houses/:id/family
// @access  Private
exports.addFamilyMember = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    const { fullName, relationship, age, gender, occupation, contactNumber } = req.body;

    if (!fullName || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Member full name and relationship are required.'
      });
    }

    const memberId = await generateMemberId();
    const member = new FamilyMember({
      memberId,
      house: house._id,
      fullName,
      relationship,
      age: age ? Number(age) : undefined,
      gender: gender || 'Prefer not to say',
      occupation: occupation || '',
      contactNumber: contactNumber || ''
    });

    await member.save();

    // Link in house document
    if (!house.familyMembers.includes(member._id)) {
      house.familyMembers.push(member._id);
      await house.save();
    }

    res.status(201).json({
      success: true,
      message: 'Family member added successfully.',
      data: member
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a family member
// @route   PUT /api/family/:memberId
// @access  Private
exports.updateFamilyMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    let member = await FamilyMember.findById(memberId);
    if (!member) member = await FamilyMember.findOne({ memberId });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member record not found.' });
    }

    const { fullName, relationship, age, gender, occupation, contactNumber } = req.body;

    if (fullName) member.fullName = fullName;
    if (relationship) member.relationship = relationship;
    if (age !== undefined) member.age = age ? Number(age) : undefined;
    if (gender) member.gender = gender;
    if (occupation !== undefined) member.occupation = occupation;
    if (contactNumber !== undefined) member.contactNumber = contactNumber;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Family member updated successfully.',
      data: member
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a family member
// @route   DELETE /api/family/:memberId
// @access  Private
exports.deleteFamilyMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    let member = await FamilyMember.findById(memberId);
    if (!member) member = await FamilyMember.findOne({ memberId });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member record not found.' });
    }

    const houseId = member.house;
    await FamilyMember.findByIdAndDelete(member._id);

    // Unlink from house
    await House.findByIdAndUpdate(houseId, {
      $pull: { familyMembers: member._id }
    });

    res.status(200).json({
      success: true,
      message: 'Family member removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all family members across houses with search, relationship filter and pagination
// @route   GET /api/family
// @access  Private
exports.getAllFamilyMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', relationship = '' } = req.query;
    const query = {};

    if (relationship) {
      query.relationship = new RegExp(`^${relationship}$`, 'i');
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { memberId: regex }, { occupation: regex }, { contactNumber: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await FamilyMember.countDocuments(query);
    const members = await FamilyMember.find(query)
      .populate('house', 'houseId houseNumber streetName locality city houseType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: members,
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
