const QRCode = require('qrcode');

/**
 * Generate a base64 Data URL for a house registration QR code.
 * Contains only non-sensitive verification reference.
 */
const generateHouseQRCode = async (house) => {
  try {
    const payload = JSON.stringify({
      ref: 'SHMS-VERIFY',
      houseId: house.houseId,
      locality: house.locality,
      city: house.city,
      type: house.houseType,
      registered: house.registrationDate ? new Date(house.registrationDate).toISOString().split('T')[0] : 'N/A'
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 150,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return null;
  }
};

/**
 * Generate QR code as Buffer (for direct embedding in PDFKit)
 */
const generateHouseQRBuffer = async (house) => {
  try {
    const payload = JSON.stringify({
      ref: 'SHMS-VERIFY',
      houseId: house.houseId,
      locality: house.locality,
      city: house.city,
      type: house.houseType,
      registered: house.registrationDate ? new Date(house.registrationDate).toISOString().split('T')[0] : 'N/A'
    });

    const qrBuffer = await QRCode.toBuffer(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 120,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return qrBuffer;
  } catch (err) {
    console.error('Failed to generate QR buffer:', err);
    return null;
  }
};

module.exports = { generateHouseQRCode, generateHouseQRBuffer };
