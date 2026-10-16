const Beat = require('../models/Beat');
const Village = require('../models/Village');
const House = require('../models/House');

// Ensure all 11 beats exist helper (clean state without fake officers or placeholder phones)
const ensureElevenBeats = async () => {
  const beatCount = await Beat.countDocuments();
  if (beatCount < 11) {
    const kannadaDigits = ['೦೧', '೦೨', '೦೩', '೦೪', '೦೫', '೦೬', '೦೭', '೦೮', '೦೯', '೧೦', '೧೧'];
    for (let i = 1; i <= 11; i++) {
      const beatNum = `Beat ${i < 10 ? '0' + i : i}`;
      const kannadaNum = kannadaDigits[i - 1];
      const existing = await Beat.findOne({ beatNumber: beatNum });
      if (!existing) {
        await Beat.create({
          beatNumber: beatNum,
          beatName: beatNum,
          beatNameKannada: `ಬೀಟ್ ${kannadaNum}`,
          officerName: '',
          officerContact: '',
          description: ''
        });
      }
    }
  }
};

// @desc    Get all 11 beats with real village counts and house counts
// @route   GET /api/beats
// @access  Public or Authenticated
exports.getBeats = async (req, res, next) => {
  try {
    await ensureElevenBeats();

    const beats = await Beat.find().sort({ beatNumber: 1 });

    // Aggregate real village counts and house counts per beat
    const beatData = await Promise.all(
      beats.map(async (b) => {
        const villageCount = await Village.countDocuments({ beatNumber: b.beatNumber });
        const houseCount = await House.countDocuments({ beatNumber: b.beatNumber });

        return {
          _id: b._id,
          beatNumber: b.beatNumber,
          beatName: b.beatName || b.beatNumber,
          beatNameKannada: b.beatNameKannada || b.beatNumber,
          officerName: b.officerName || '',
          officerContact: b.officerContact || '',
          description: b.description || '',
          villageCount,
          houseCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: beatData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get specific beat with its assigned villages and stats
// @route   GET /api/beats/:beatNumber
// @access  Authenticated
exports.getBeatByNumber = async (req, res, next) => {
  try {
    let beatNumber = decodeURIComponent(req.params.beatNumber);
    if (!beatNumber.toLowerCase().startsWith('beat')) {
      const num = parseInt(beatNumber.replace(/\D/g, ''), 10);
      beatNumber = `Beat ${num < 10 ? '0' + num : num}`;
    }

    let beat = await Beat.findOne({ beatNumber: new RegExp(`^${beatNumber}$`, 'i') });
    if (!beat) {
      beat = await Beat.create({
        beatNumber,
        beatName: beatNumber,
        beatNameKannada: beatNumber,
        officerName: '',
        officerContact: '',
        description: ''
      });
    }

    const villages = await Village.find({
      beatNumber: new RegExp(`^${beat.beatNumber}$`, 'i')
    }).sort({ villageId: 1, name: 1 });

    // Attach house count per village
    const villagesWithCounts = await Promise.all(
      villages.map(async (v) => {
        const houseCount = await House.countDocuments({
          $or: [{ villageRef: v._id }, { village: v.name }, { village: v.nameKannada }]
        });
        return {
          ...v.toObject(),
          houseCount
        };
      })
    );

    const totalHouses = await House.countDocuments({ beatNumber: beat.beatNumber });

    res.status(200).json({
      success: true,
      data: {
        beat,
        villages: villagesWithCounts,
        totalHouses,
        villageCount: villages.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update beat information (name, Kannada name, officer, contact)
// @route   PUT /api/beats/:beatNumber
// @access  Authenticated (Admin / Staff)
exports.updateBeat = async (req, res, next) => {
  try {
    let beatNumber = decodeURIComponent(req.params.beatNumber);
    if (!beatNumber.toLowerCase().startsWith('beat')) {
      const num = parseInt(beatNumber.replace(/\D/g, ''), 10);
      beatNumber = `Beat ${num < 10 ? '0' + num : num}`;
    }

    let beat = await Beat.findOne({ beatNumber: new RegExp(`^${beatNumber}$`, 'i') });
    if (!beat) {
      return res.status(404).json({
        success: false,
        message: `Beat ${beatNumber} not found.`
      });
    }

    const { beatName, beatNameKannada, officerName, officerContact, description } = req.body;

    if (beatName !== undefined) beat.beatName = beatName.trim();
    if (beatNameKannada !== undefined) beat.beatNameKannada = beatNameKannada.trim();
    if (officerName !== undefined) beat.officerName = officerName.trim();
    if (officerContact !== undefined) beat.officerContact = officerContact.trim();
    if (description !== undefined) beat.description = description.trim();

    await beat.save();

    res.status(200).json({
      success: true,
      message: `Beat ${beatNumber} updated successfully.`,
      data: beat
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a village to a beat
// @route   POST /api/beats/:beatNumber/villages
// @access  Authenticated (Admin / Staff)
exports.addVillageToBeat = async (req, res, next) => {
  try {
    let beatNumber = decodeURIComponent(req.params.beatNumber);
    if (!beatNumber.toLowerCase().startsWith('beat')) {
      const num = parseInt(beatNumber.replace(/\D/g, ''), 10);
      beatNumber = `Beat ${num < 10 ? '0' + num : num}`;
    }

    const { name, nameKannada, taluk, district, pincode, landmark } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Village name is required.'
      });
    }

    const beat = await Beat.findOne({ beatNumber: new RegExp(`^${beatNumber}$`, 'i') });

    const villageId = `VIL-${Date.now().toString().slice(-5)}`;
    const village = new Village({
      villageId,
      name: name.trim(),
      nameKannada: nameKannada ? nameKannada.trim() : name.trim(),
      beatNumber,
      beatRef: beat ? beat._id : undefined,
      taluk: taluk ? taluk.trim() : 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
      district: district ? district.trim() : 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
      state: 'Karnataka',
      pincode: pincode ? pincode.trim() : '',
      landmark: landmark ? landmark.trim() : ''
    });

    await village.save();

    res.status(201).json({
      success: true,
      message: `Village ${village.name} added to ${beatNumber} successfully.`,
      data: village
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a village
// @route   PUT /api/villages/:id
// @access  Authenticated (Admin / Staff)
exports.updateVillage = async (req, res, next) => {
  try {
    const { id } = req.params;
    let village;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      village = await Village.findById(id);
    }
    if (!village) {
      village = await Village.findOne({ villageId: id });
    }
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found.'
      });
    }

    const { name, nameKannada, taluk, district, pincode, landmark } = req.body;

    if (name) village.name = name.trim();
    if (nameKannada !== undefined) village.nameKannada = nameKannada.trim();
    if (taluk !== undefined) village.taluk = taluk.trim();
    if (district !== undefined) village.district = district.trim();
    if (pincode !== undefined) village.pincode = pincode.trim();
    if (landmark !== undefined) village.landmark = landmark.trim();

    await village.save();

    res.status(200).json({
      success: true,
      message: 'Village updated successfully.',
      data: village
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a village
// @route   DELETE /api/villages/:id
// @access  Authenticated (Admin)
exports.deleteVillage = async (req, res, next) => {
  try {
    const { id } = req.params;
    let village;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      village = await Village.findById(id);
    }
    if (!village) {
      village = await Village.findOne({ villageId: id });
    }
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found.'
      });
    }

    // Check if any houses are registered in this village
    const houseCount = await House.countDocuments({
      $or: [{ villageRef: village._id }, { village: village.name }]
    });

    if (houseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete village "${village.name}" because it has ${houseCount} registered house(s). Please reassign or delete the houses first.`
      });
    }

    await Village.findByIdAndDelete(village._id);

    res.status(200).json({
      success: true,
      message: `Village "${village.name}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get village dashboard with registered houses
// @route   GET /api/villages/:id
// @access  Authenticated
exports.getVillageDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let village;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      village = await Village.findById(id);
    }
    if (!village) {
      village = await Village.findOne({
        $or: [
          { villageId: id },
          { name: new RegExp(`^${id}$`, 'i') },
          { nameKannada: new RegExp(`^${id}$`, 'i') }
        ]
      });
    }

    if (!village) {
      return res.status(404).json({
        success: false,
        message: `Village with identifier "${id}" not found.`
      });
    }

    // Find actual registered houses in this village
    const houses = await House.find({
      $or: [
        { villageRef: village._id },
        { village: village.name },
        { village: village.nameKannada }
      ]
    })
      .populate('owner')
      .populate('familyMembers')
      .populate('photos')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        village,
        totalHouses: houses.length,
        houses
      }
    });
  } catch (err) {
    next(err);
  }
};
