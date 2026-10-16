const fs = require('fs');
const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');
const Village = require('../models/Village');
const { generateHouseId, generateOwnerId, generateMemberId } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all houses with search, filtering, sorting, pagination
// @route   GET /api/houses
// @access  Private
exports.getHouses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      beatNumber = '',
      village = '',
      locality = '',
      houseType = '',
      ownershipType = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate = '',
      endDate = ''
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Role-based staff jurisdiction restriction
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
          message: 'No beats are currently assigned to your staff account.'
        });
      }

      if (beatNumber) {
        if (!assignedBeats.includes(beatNumber)) {
          return res.status(200).json({
            success: true,
            data: [],
            pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
            message: `Beat "${beatNumber}" is outside your assigned beats (${assignedBeats.join(', ')}).`
          });
        }
        query.beatNumber = new RegExp(`^${beatNumber}$`, 'i');
      } else {
        query.beatNumber = { $in: assignedBeats };
      }

      if (req.user.assignedVillages && req.user.assignedVillages.length > 0) {
        query.village = { $in: req.user.assignedVillages };
      }
    } else if (beatNumber) {
      // Admin filter by beatNumber
      query.beatNumber = new RegExp(`^${beatNumber}$`, 'i');
    }

    // Filter by village
    if (village) {
      query.$or = [{ village: new RegExp(`^${village}$`, 'i') }, { city: new RegExp(`^${village}$`, 'i') }];
    }

    // Filter by locality
    if (locality) {
      query.locality = new RegExp(`^${locality}$`, 'i');
    }

    // Filter by houseType
    if (houseType) {
      query.houseType = houseType;
    }

    // Filter by ownershipType
    if (ownershipType) {
      query.ownershipType = ownershipType;
    }

    // Filter by status
    if (status) {
      query.registrationStatus = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.registrationDate = {};
      if (startDate) query.registrationDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.registrationDate.$lte = end;
      }
    }

    // Search by House ID or address fields
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { houseId: searchRegex },
        { houseNumber: searchRegex },
        { streetName: searchRegex },
        { locality: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
        { pincode: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let houseQuery = House.find(query)
      .populate('owner')
      .populate('familyMembers')
      .populate('photos')
      .populate('registeredBy', 'fullName username role')
      .sort(sortOptions);

    // If searching by owner name specifically
    if (search.trim()) {
      const matchedOwners = await Owner.find({
        fullName: new RegExp(search.trim(), 'i')
      }).select('house');

      if (matchedOwners.length > 0) {
        const ownerHouseIds = matchedOwners.map((o) => o.house);
        query.$or.push({ _id: { $in: ownerHouseIds } });
        houseQuery = House.find(query)
          .populate('owner')
          .populate('familyMembers')
          .populate('photos')
          .populate('registeredBy', 'fullName username role')
          .sort(sortOptions);
      }
    }

    const total = await House.countDocuments(query);
    const houses = await houseQuery.skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      data: houses,
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

// @desc    Get single house by ID (accepts Mongo _id or houseId)
// @route   GET /api/houses/:id
// @access  Private
exports.getHouseById = async (req, res, next) => {
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
      return res.status(404).json({
        success: false,
        message: `House with ID "${id}" was not found.`
      });
    }

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (!assignedBeats.includes(house.beatNumber)) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You are not authorized to view house records outside your assigned beat jurisdiction.'
        });
      }
    }

    await house.populate([
      { path: 'owner' },
      { path: 'familyMembers' },
      { path: 'photos' },
      { path: 'registeredBy', select: 'fullName username role' }
    ]);

    res.status(200).json({
      success: true,
      data: house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new house registration
// @route   POST /api/houses
// @access  Private
exports.createHouse = async (req, res, next) => {
  try {
    const {
      houseNumber,
      streetName,
      beatNumber,
      village,
      locality,
      city,
      subdistrict,
      district,
      state,
      pincode,
      houseType,
      numberOfFloors,
      numberOfRooms,
      ownershipType,
      gps,
      remarks,
      owner: ownerData,
      familyMembers: familyData,
      security: securityData,
      issues: issuesData
    } = req.body;

    const assignedVillage = village ? village.trim() : (city ? city.trim() : (locality ? locality.trim() : ''));
    const assignedCity = city ? city.trim() : assignedVillage;
    const assignedBeat = beatNumber ? beatNumber.trim() : 'Beat 01';

    // Role-based staff jurisdiction check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: Your staff account has not been assigned to any beats yet. Please contact the administrator.'
        });
      }
      if (!assignedBeats.includes(assignedBeat)) {
        return res.status(403).json({
          success: false,
          message: `Permission Denied: You are only authorized to register houses within your assigned beat(s): ${assignedBeats.join(', ')}`
        });
      }
      if (req.user.assignedVillages && req.user.assignedVillages.length > 0) {
        if (!req.user.assignedVillages.includes(assignedVillage)) {
          return res.status(403).json({
            success: false,
            message: `Permission Denied: You are only authorized to register houses within your assigned village(s): ${req.user.assignedVillages.join(', ')}`
          });
        }
      }
    }

    // Validate only essential mandatory fields
    if (!houseNumber || !houseNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'House number is required.'
      });
    }

    if (!assignedVillage) {
      return res.status(400).json({
        success: false,
        message: 'Village is required.'
      });
    }

    // Parse GPS if provided (optional)
    let parsedGps = null;
    if (gps && gps.latitude !== undefined && gps.latitude !== '' && gps.longitude !== undefined && gps.longitude !== '') {
      const lat = parseFloat(gps.latitude);
      const lng = parseFloat(gps.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        parsedGps = {
          latitude: lat,
          longitude: lng,
          accuracy: gps.accuracy ? parseFloat(gps.accuracy) : 0,
          timestamp: gps.timestamp ? new Date(gps.timestamp) : new Date(),
          source: gps.source || 'gps'
        };
      }
    }

    // Auto-generate House ID
    const houseId = await generateHouseId();

    // Find linked Village document
    let villageDoc = await Village.findOne({
      beatNumber: assignedBeat,
      $or: [{ name: assignedVillage }, { nameKannada: assignedVillage }]
    });
    if (!villageDoc) {
      villageDoc = await Village.findOne({
        $or: [{ name: assignedVillage }, { nameKannada: assignedVillage }]
      });
    }

    // Parse Security Present on Premises (ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ)
    const security = {
      cctvInstalled: (securityData && (securityData.cctvInstalled === 'Yes' || securityData.cctvInstalled === 'ಹೌದು')) ? 'Yes' : 'No',
      securityGuardPresent: (securityData && (securityData.securityGuardPresent === 'Yes' || securityData.securityGuardPresent === 'ಹೌದು')) ? 'Yes' : 'No',
      otherArrangements: securityData?.otherArrangements ? securityData.otherArrangements.trim() : ''
    };

    // Parse Issues and Suggestions Received (ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು)
    const initialIssues = [];
    if (Array.isArray(issuesData) && issuesData.length > 0) {
      issuesData.forEach((iss) => {
        if (iss && (iss.description || iss.additionalRemarks)) {
          initialIssues.push({
            issueId: 'ISS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
            dateReported: iss.dateReported ? new Date(iss.dateReported) : new Date(),
            category: (iss.category === 'Other department' || iss.category === 'ಇತರ ಇಲಾಖೆ') ? 'Other department' : 'Police-related',
            description: (iss.description || '').trim(),
            additionalRemarks: (iss.additionalRemarks || '').trim(),
            reportedBy: req.user ? req.user._id : null,
            reportedByName: req.user ? (req.user.fullName || req.user.username) : 'Field Officer',
            actionTaken: (iss.actionTaken || '').trim(),
            responsibleDepartment: (iss.responsibleDepartment || (iss.category === 'Other department' ? 'Concerned Department' : 'Police Department')).trim(),
            actionDate: iss.actionDate ? new Date(iss.actionDate) : undefined,
            status: iss.status || 'Pending',
            followUpRemarks: (iss.followUpRemarks || '').trim()
          });
        }
      });
    }

    const house = new House({
      houseId,
      houseNumber: houseNumber.trim(),
      streetName: streetName ? streetName.trim() : '',
      beatNumber: assignedBeat,
      village: assignedVillage,
      villageRef: villageDoc ? villageDoc._id : undefined,
      locality: locality ? locality.trim() : assignedVillage,
      city: assignedCity,
      subdistrict: subdistrict ? subdistrict.trim() : (villageDoc?.taluk || 'ದೊಡ್ಡಬಳ್ಳಾಪುರ'),
      district: district ? district.trim() : (villageDoc?.district || 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ'),
      state: state ? state.trim() : 'Karnataka',
      pincode: pincode ? pincode.trim() : (villageDoc?.pincode || ''),
      houseType: houseType || 'Independent house',
      numberOfFloors: Number(numberOfFloors) || 1,
      numberOfRooms: Number(numberOfRooms) || 1,
      ownershipType: ownershipType || 'Owned',
      gps: parsedGps,
      security,
      issues: initialIssues,
      remarks: remarks ? remarks.trim() : '',
      registrationDate: new Date(),
      registrationStatus: 'Registered',
      registeredBy: req.user ? req.user._id : null
    });

    await house.save();

    // Create Owner if provided
    if (ownerData && ownerData.fullName && ownerData.fullName.trim()) {
      const ownerId = await generateOwnerId();
      const owner = new Owner({
        ownerId,
        house: house._id,
        fullName: ownerData.fullName.trim(),
        contactNumber: ownerData.contactNumber ? ownerData.contactNumber.trim() : '',
        email: ownerData.email || '',
        ownershipType: ownerData.ownershipType || house.ownershipType,
        correspondenceAddress: ownerData.correspondenceAddress || '',
        age: ownerData.age ? Number(ownerData.age) : undefined,
        representativeStatus: ownerData.representativeStatus || 'Owner',
        idReference: ownerData.idReference || ''
      });
      await owner.save();
      house.owner = owner._id;
    }

    // Create Family Members if provided
    if (Array.isArray(familyData) && familyData.length > 0) {
      const memberIds = [];
      for (const m of familyData) {
        if (m.fullName && m.relationship) {
          const memberId = await generateMemberId();
          const member = new FamilyMember({
            memberId,
            house: house._id,
            fullName: m.fullName,
            relationship: m.relationship,
            age: m.age ? Number(m.age) : undefined,
            gender: m.gender || 'Prefer not to say',
            occupation: m.occupation || '',
            contactNumber: m.contactNumber || ''
          });
          await member.save();
          memberIds.push(member._id);
        }
      }
      house.familyMembers = memberIds;
    }

    await house.save();

    await house.populate([
      { path: 'owner' },
      { path: 'familyMembers' },
      { path: 'photos' }
    ]);

    // Audit log
    await logAuditEvent({
      action: 'HOUSE_REGISTERED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Officer',
      targetResource: `House: ${house.houseId}`,
      details: {
        houseId: house.houseId,
        beatNumber: house.beatNumber,
        village: house.village,
        houseNumber: house.houseNumber
      },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: `House registration created successfully with ID ${house.houseId}`,
      data: house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update house registration
// @route   PUT /api/houses/:id
// @access  Private
exports.updateHouse = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);

    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House registration not found.'
      });
    }

    // Role-based staff check
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (!assignedBeats.includes(house.beatNumber)) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You are not authorized to edit houses outside your assigned beat jurisdiction.'
        });
      }
    }

    const {
      houseNumber,
      streetName,
      locality,
      beatNumber,
      village,
      city,
      subdistrict,
      district,
      state,
      pincode,
      houseType,
      numberOfFloors,
      numberOfRooms,
      ownershipType,
      gps,
      registrationStatus,
      remarks,
      owner: ownerData,
      security: securityData
    } = req.body;

    if (beatNumber) house.beatNumber = beatNumber;
    if (village) house.village = village;
    if (houseNumber) house.houseNumber = houseNumber;
    if (streetName) house.streetName = streetName;
    if (locality) house.locality = locality;
    if (city) house.city = city;
    if (subdistrict !== undefined) house.subdistrict = subdistrict;
    if (district) house.district = district;
    if (state) house.state = state;
    if (pincode) house.pincode = pincode;
    if (houseType) house.houseType = houseType;
    if (numberOfFloors) house.numberOfFloors = Number(numberOfFloors);
    if (numberOfRooms) house.numberOfRooms = Number(numberOfRooms);
    if (ownershipType) house.ownershipType = ownershipType;
    if (registrationStatus) house.registrationStatus = registrationStatus;
    if (remarks !== undefined) house.remarks = remarks;

    if (securityData) {
      house.security = {
        cctvInstalled: (securityData.cctvInstalled === 'Yes' || securityData.cctvInstalled === 'ಹೌದು') ? 'Yes' : 'No',
        securityGuardPresent: (securityData.securityGuardPresent === 'Yes' || securityData.securityGuardPresent === 'ಹೌದು') ? 'Yes' : 'No',
        otherArrangements: securityData.otherArrangements !== undefined ? securityData.otherArrangements.trim() : (house.security?.otherArrangements || '')
      };
    }

    if (gps && gps.latitude !== undefined && gps.latitude !== '' && gps.longitude !== undefined && gps.longitude !== '') {
      const lat = parseFloat(gps.latitude);
      const lng = parseFloat(gps.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        house.gps = {
          latitude: lat,
          longitude: lng,
          accuracy: gps.accuracy ? parseFloat(gps.accuracy) : (house.gps?.accuracy || 0),
          timestamp: new Date(),
          source: gps.source || 'map_click'
        };
      }
    } else if (gps === null) {
      house.gps = null;
    }

    // Update or create owner if data provided
    if (ownerData && (ownerData.fullName || ownerData.contactNumber)) {
      if (house.owner) {
        await Owner.findByIdAndUpdate(house.owner, {
          fullName: ownerData.fullName,
          contactNumber: ownerData.contactNumber,
          email: ownerData.email || '',
          ownershipType: ownerData.ownershipType || house.ownershipType,
          correspondenceAddress: ownerData.correspondenceAddress || '',
          age: ownerData.age ? Number(ownerData.age) : undefined,
          idReference: ownerData.idReference || ''
        });
      } else {
        const ownerId = await generateOwnerId();
        const newOwner = new Owner({
          ownerId,
          house: house._id,
          fullName: ownerData.fullName,
          contactNumber: ownerData.contactNumber,
          email: ownerData.email || '',
          ownershipType: ownerData.ownershipType || house.ownershipType,
          correspondenceAddress: ownerData.correspondenceAddress || '',
          age: ownerData.age ? Number(ownerData.age) : undefined,
          idReference: ownerData.idReference || ''
        });
        await newOwner.save();
        house.owner = newOwner._id;
      }
    }

    await house.save();

    await house.populate([
      { path: 'owner' },
      { path: 'familyMembers' },
      { path: 'photos' }
    ]);

    // Audit log
    await logAuditEvent({
      action: 'HOUSE_UPDATED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Officer',
      targetResource: `House: ${house.houseId}`,
      details: {
        houseId: house.houseId,
        beatNumber: house.beatNumber,
        village: house.village
      },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: 'House registration updated successfully.',
      data: house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete house registration and cleanly wipe linked records and photos
// @route   DELETE /api/houses/:id
// @access  Private (Admin only)
exports.deleteHouse = async (req, res, next) => {
  try {
    // Only Admin can delete house records
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Only administrators are authorized to permanently delete house registrations.'
      });
    }

    const id = req.params.id;
    let house = await House.findById(id);

    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House registration not found.'
      });
    }

    const houseDbId = house._id;

    // 1. Delete linked Owner
    await Owner.deleteMany({ house: houseDbId });

    // 2. Delete linked Family Members
    await FamilyMember.deleteMany({ house: houseDbId });

    // 3. Find and delete linked House Photos and physically remove files from disk
    const photos = await HousePhoto.find({ house: houseDbId });
    for (const p of photos) {
      if (p.filePath && fs.existsSync(p.filePath)) {
        try {
          fs.unlinkSync(p.filePath);
        } catch (fileErr) {
          console.warn(`Failed to unlink photo file ${p.filePath}:`, fileErr.message);
        }
      }
    }
    await HousePhoto.deleteMany({ house: houseDbId });

    // 4. Delete House document
    await House.findByIdAndDelete(houseDbId);

    // Audit log
    await logAuditEvent({
      action: 'HOUSE_DELETED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Admin',
      targetResource: `House: ${house.houseId}`,
      details: {
        houseId: house.houseId,
        beatNumber: house.beatNumber,
        village: house.village
      },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `House registration ${house.houseId} and all associated records and media files were deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get unique localities for filter dropdowns
// @route   GET /api/houses/meta/localities
// @access  Private
exports.getLocalities = async (req, res, next) => {
  try {
    const localities = await House.distinct('locality');
    const houseTypes = await House.distinct('houseType');
    const cities = await House.distinct('city');
    const villages = await House.distinct('village');
    const beats = [
      'Beat 01', 'Beat 02', 'Beat 03', 'Beat 04', 'Beat 05',
      'Beat 06', 'Beat 07', 'Beat 08', 'Beat 09', 'Beat 10', 'Beat 11'
    ];

    res.status(200).json({
      success: true,
      data: {
        localities: localities.filter(Boolean).sort(),
        houseTypes: houseTypes.filter(Boolean).sort(),
        cities: cities.filter(Boolean).sort(),
        villages: villages.filter(Boolean).sort(),
        beats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record new issue or suggestion for an existing house
// @route   POST /api/houses/:id/issues
// @access  Private (Admin or Staff within assigned beat)
exports.addHouseIssue = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }
    if (!house) {
      return res.status(404).json({ success: false, message: 'House registration not found.' });
    }

    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (!assignedBeats.includes(house.beatNumber)) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: You are not authorized to record issues for houses outside your assigned beat jurisdiction.'
        });
      }
    }

    const { dateReported, category, description, additionalRemarks } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Issue or suggestion description is required.'
      });
    }

    const newIssue = {
      issueId: 'ISS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
      dateReported: dateReported ? new Date(dateReported) : new Date(),
      category: (category === 'Other department' || category === 'ಇತರ ಇಲಾಖೆ') ? 'Other department' : 'Police-related',
      description: description.trim(),
      additionalRemarks: additionalRemarks ? additionalRemarks.trim() : '',
      reportedBy: req.user ? req.user._id : null,
      reportedByName: req.user ? (req.user.fullName || req.user.username) : 'Field Officer',
      actionTaken: '',
      responsibleDepartment: category === 'Other department' ? 'Concerned Department' : 'Police Department',
      status: 'Pending',
      followUpRemarks: ''
    };

    house.issues.push(newIssue);
    await house.save();

    await logAuditEvent({
      action: 'HOUSE_ISSUE_RECORDED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Officer',
      targetResource: `House: ${house.houseId}`,
      details: {
        houseId: house.houseId,
        beatNumber: house.beatNumber,
        village: house.village,
        issueId: newIssue.issueId,
        category: newIssue.category
      },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'New issue or suggestion recorded successfully.',
      data: house.issues[house.issues.length - 1],
      house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update action taken and status for an issue (Admin only)
// @route   PUT /api/houses/:id/issues/:issueId/action
// @access  Private (Admin only)
exports.updateIssueAction = async (req, res, next) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Only administrators can update department action taken and resolution status.'
      });
    }

    const { id, issueId } = req.params;
    let house = await House.findById(id);
    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }
    if (!house) {
      return res.status(404).json({ success: false, message: 'House registration not found.' });
    }

    const issue = house.issues.find(
      (iss) => (iss._id && iss._id.toString() === issueId) || iss.issueId === issueId
    );

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found on this house.' });
    }

    const {
      actionTaken,
      responsibleDepartment,
      actionDate,
      status,
      followUpRemarks
    } = req.body;

    if (actionTaken !== undefined) issue.actionTaken = actionTaken.trim();
    if (responsibleDepartment !== undefined) issue.responsibleDepartment = responsibleDepartment.trim();
    if (actionDate !== undefined) issue.actionDate = actionDate ? new Date(actionDate) : new Date();
    if (status !== undefined) {
      if (['Pending', 'In Progress', 'Resolved'].includes(status)) {
        issue.status = status;
      }
    }
    if (followUpRemarks !== undefined) issue.followUpRemarks = followUpRemarks.trim();

    issue.actionUpdatedBy = req.user ? req.user._id : null;
    issue.actionUpdatedByName = req.user ? (req.user.fullName || req.user.username) : 'Administrator';
    issue.actionUpdatedAt = new Date();

    await house.save();

    await logAuditEvent({
      action: 'HOUSE_ISSUE_ACTION_UPDATED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Administrator',
      targetResource: `House: ${house.houseId} Issue: ${issue.issueId}`,
      details: {
        houseId: house.houseId,
        beatNumber: house.beatNumber,
        issueId: issue.issueId,
        status: issue.status,
        responsibleDepartment: issue.responsibleDepartment
      },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: 'Department action taken and issue status updated successfully.',
      data: issue,
      house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update security arrangements for a house (Admin only)
// @route   PUT /api/houses/:id/security
// @access  Private (Admin only)
exports.updateHouseSecurity = async (req, res, next) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Only administrators can update security survey settings.'
      });
    }

    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) {
      house = await House.findOne({ houseId: id.toUpperCase() });
    }
    if (!house) {
      return res.status(404).json({ success: false, message: 'House registration not found.' });
    }

    const { cctvInstalled, securityGuardPresent, otherArrangements } = req.body;
    house.security = {
      cctvInstalled: (cctvInstalled === 'Yes' || cctvInstalled === 'ಹೌದು') ? 'Yes' : 'No',
      securityGuardPresent: (securityGuardPresent === 'Yes' || securityGuardPresent === 'ಹೌದು') ? 'Yes' : 'No',
      otherArrangements: otherArrangements !== undefined ? otherArrangements.trim() : (house.security?.otherArrangements || '')
    };

    await house.save();

    await logAuditEvent({
      action: 'HOUSE_SECURITY_UPDATED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.fullName : 'Administrator',
      targetResource: `House: ${house.houseId}`,
      details: {
        houseId: house.houseId,
        security: house.security
      },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: 'Security survey details updated successfully.',
      data: house.security,
      house
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all issues across houses with filtering, search, and pagination
// @route   GET /api/houses/issues/ledger
// @access  Private
exports.getIssuesLedger = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      category = '',
      beatNumber = '',
      village = ''
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const matchQuery = {};

    // Role-based filtering for staff
    if (req.user && req.user.role === 'staff') {
      const assignedBeats = req.user.assignedBeats || [];
      if (assignedBeats.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          stats: { total: 0, pending: 0, inProgress: 0, resolved: 0, policeRelated: 0, otherDept: 0 },
          pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 }
        });
      }
      if (beatNumber) {
        if (!assignedBeats.includes(beatNumber)) {
          return res.status(200).json({
            success: true,
            data: [],
            stats: { total: 0, pending: 0, inProgress: 0, resolved: 0, policeRelated: 0, otherDept: 0 },
            pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 }
          });
        }
        matchQuery.beatNumber = new RegExp(`^${beatNumber}$`, 'i');
      } else {
        matchQuery.beatNumber = { $in: assignedBeats };
      }
    } else if (beatNumber) {
      matchQuery.beatNumber = new RegExp(`^${beatNumber}$`, 'i');
    }

    if (village) {
      matchQuery.village = new RegExp(`^${village}$`, 'i');
    }

    // Match houses that have at least one issue
    matchQuery['issues.0'] = { $exists: true };

    const houses = await House.find(matchQuery)
      .populate('owner', 'fullName contactNumber')
      .select('houseId beatNumber village houseNumber streetName owner security issues createdAt')
      .lean();

    // Flatten issues with parent house context
    let allIssues = [];
    houses.forEach((h) => {
      if (Array.isArray(h.issues)) {
        h.issues.forEach((iss) => {
          allIssues.push({
            ...iss,
            houseDbId: h._id,
            houseId: h.houseId,
            beatNumber: h.beatNumber,
            village: h.village,
            houseNumber: h.houseNumber,
            streetName: h.streetName,
            ownerName: h.owner?.fullName || 'N/A',
            ownerContact: h.owner?.contactNumber || 'N/A',
            cctvInstalled: h.security?.cctvInstalled || 'No',
            securityGuardPresent: h.security?.securityGuardPresent || 'No'
          });
        });
      }
    });

    // Compute stats
    const stats = {
      total: allIssues.length,
      pending: allIssues.filter((i) => i.status === 'Pending').length,
      inProgress: allIssues.filter((i) => i.status === 'In Progress').length,
      resolved: allIssues.filter((i) => i.status === 'Resolved').length,
      policeRelated: allIssues.filter((i) => i.category === 'Police-related').length,
      otherDept: allIssues.filter((i) => i.category === 'Other department').length
    };

    // Filter by status
    if (status) {
      allIssues = allIssues.filter((i) => i.status === status);
    }

    // Filter by category
    if (category) {
      allIssues = allIssues.filter((i) => i.category === category);
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      allIssues = allIssues.filter(
        (i) =>
          (i.houseId && i.houseId.toLowerCase().includes(q)) ||
          (i.issueId && i.issueId.toLowerCase().includes(q)) ||
          (i.village && i.village.toLowerCase().includes(q)) ||
          (i.ownerName && i.ownerName.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.responsibleDepartment && i.responsibleDepartment.toLowerCase().includes(q)) ||
          (i.actionTaken && i.actionTaken.toLowerCase().includes(q))
      );
    }

    // Sort by dateReported descending
    allIssues.sort((a, b) => new Date(b.dateReported || b.createdAt) - new Date(a.dateReported || a.createdAt));

    const total = allIssues.length;
    const paginated = allIssues.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      data: paginated,
      stats,
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

