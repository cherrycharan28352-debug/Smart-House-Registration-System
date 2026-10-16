const fs = require('fs');
const path = require('path');
const House = require('../models/House');
const HousePhoto = require('../models/HousePhoto');
const { generatePhotoId } = require('../utils/idGenerator');

// @desc    Upload photographs for a house
// @route   POST /api/houses/:id/photos
// @access  Private
exports.uploadHousePhotos = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photo files were uploaded.'
      });
    }

    const category = req.body.category || 'Front view';
    const caption = req.body.caption || '';
    const uploadedPhotos = [];

    for (const file of req.files) {
      const photoId = await generatePhotoId();
      const photo = new HousePhoto({
        photoId,
        house: house._id,
        filename: file.filename,
        originalName: file.originalname,
        category,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        caption
      });

      await photo.save();
      uploadedPhotos.push(photo);

      // Link to house
      if (!house.photos.includes(photo._id)) {
        house.photos.push(photo._id);
      }
    }

    await house.save();

    res.status(201).json({
      success: true,
      message: `${uploadedPhotos.length} photograph(s) uploaded successfully.`,
      data: uploadedPhotos
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get photos for a specific house
// @route   GET /api/houses/:id/photos
// @access  Private
exports.getHousePhotos = async (req, res, next) => {
  try {
    const id = req.params.id;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found.' });
    }

    const photos = await HousePhoto.find({ house: house._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a house photo
// @route   DELETE /api/houses/:id/photos/:photoId
// @access  Private
exports.deleteHousePhoto = async (req, res, next) => {
  try {
    const { id, photoId } = req.params;
    let house = await House.findById(id);
    if (!house) house = await House.findOne({ houseId: id.toUpperCase() });

    let photo = await HousePhoto.findById(photoId);
    if (!photo) photo = await HousePhoto.findOne({ photoId });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo record not found.' });
    }

    // Unlink physical file from disk
    if (photo.filePath && fs.existsSync(photo.filePath)) {
      try {
        fs.unlinkSync(photo.filePath);
      } catch (err) {
        console.warn('Could not remove file from storage:', err.message);
      }
    }

    await HousePhoto.findByIdAndDelete(photo._id);

    if (house) {
      await House.findByIdAndUpdate(house._id, {
        $pull: { photos: photo._id }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all photos for the Gallery Page with category filter
// @route   GET /api/photos
// @access  Private
exports.getAllPhotos = async (req, res, next) => {
  try {
    const { category = '', search = '', page = 1, limit = 16 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 16;
    const skip = (pageNum - 1) * limitNum;

    const total = await HousePhoto.countDocuments(query);
    const photos = await HousePhoto.find(query)
      .populate('house', 'houseId houseNumber streetName locality city houseType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: photos,
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

// @desc    Securely stream photo file with access control
// @route   GET /api/photos/view/:photoId
// @access  Private / Authenticated
exports.viewPhotoFile = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    let photo = await HousePhoto.findById(photoId);
    if (!photo) photo = await HousePhoto.findOne({ photoId });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }

    if (!photo.filePath || !fs.existsSync(photo.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Underlying photo file is missing on server storage.'
      });
    }

    res.setHeader('Content-Type', photo.mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    const fileStream = fs.createReadStream(photo.filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};
