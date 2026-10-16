const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadHousePhotos,
  getHousePhotos,
  deleteHousePhoto,
  getAllPhotos,
  viewPhotoFile
} = require('../controllers/photoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// General photo gallery and viewing
router.get('/', protect, getAllPhotos);
router.get('/view/:photoId', protect, viewPhotoFile);

// House-scoped photo endpoints
router.post('/houses/:id/photos', protect, authorize('admin', 'staff'), upload.array('photos', 5), uploadHousePhotos);
router.get('/houses/:id/photos', protect, getHousePhotos);
router.delete('/houses/:id/photos/:photoId', protect, authorize('admin', 'staff'), deleteHousePhoto);

module.exports = router;
