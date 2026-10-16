const express = require('express');
const router = express.Router();
const {
  exportSingleHousePDF,
  exportSingleHouseExcel,
  exportBulkPDF,
  exportBulkExcel
} = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id/export/pdf', protect, exportSingleHousePDF);
router.get('/:id/export/excel', protect, exportSingleHouseExcel);
router.post('/export/bulk/pdf', protect, exportBulkPDF);
router.post('/export/bulk/excel', protect, exportBulkExcel);

module.exports = router;
