const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generateHouseQRBuffer } = require('./qrService');

// Font paths for Noto Sans Kannada (supports full Unicode Kannada + Latin)
const fontsDir = path.join(__dirname, '..', 'fonts');
const fontRegPath = path.join(fontsDir, 'NotoSansKannada-Regular.ttf');
const fontBoldPath = path.join(fontsDir, 'NotoSansKannada-Bold.ttf');

const setupDocFonts = (doc) => {
  if (fs.existsSync(fontRegPath)) {
    doc.registerFont('Kannada', fontRegPath);
    doc.registerFont('Kannada-Oblique', fontRegPath);
  }
  if (fs.existsSync(fontBoldPath)) {
    doc.registerFont('Kannada-Bold', fontBoldPath);
  }
};

const FONT_REG = fs.existsSync(fontRegPath) ? 'Kannada' : 'Helvetica';
const FONT_BOLD = fs.existsSync(fontBoldPath) ? 'Kannada-Bold' : 'Helvetica-Bold';
const FONT_OBLIQUE = fs.existsSync(fontRegPath) ? 'Kannada-Oblique' : 'Helvetica-Oblique';

/**
 * Build a styled registration certificate/report for a single house.
 */
const buildHousePDFPage = async (doc, house, isFirst = true) => {
  if (!isFirst) {
    doc.addPage();
  }

  const primaryNavy = '#0f172a';
  const secondaryNavy = '#1e3a8a';
  const accentBlue = '#2563eb';
  const textDark = '#1e293b';
  const textMuted = '#64748b';
  const lightBg = '#f1f5f9';
  const borderColor = '#cbd5e1';

  // --- Header Banner ---
  doc.rect(40, 35, 532, 60).fillAndStroke(lightBg, borderColor);

  doc.fontSize(14).fillColor(secondaryNavy).font(FONT_BOLD)
     .text('MANE MANEGE POLICE (ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್)', 50, 43, { width: 400 });
  
  doc.fontSize(8.5).fillColor(textMuted).font(FONT_REG)
     .text('Karnataka State Police • ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ • Beat Survey Registry', 50, 63)
     .text(`Official Beat Survey Record | Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, 76);

  // QR Code on Header
  try {
    const qrBuffer = await generateHouseQRBuffer(house);
    if (qrBuffer) {
      doc.image(qrBuffer, 480, 40, { width: 50, height: 50 });
    }
  } catch (qrErr) {
    console.error('Error drawing QR buffer in PDF:', qrErr);
  }

  let y = 110;

  // --- Registration Meta Badge Bar ---
  doc.rect(40, y, 532, 28).fill(primaryNavy);
  doc.fontSize(10).fillColor('#ffffff').font(FONT_BOLD)
     .text(`HOUSE SURVEY ID: ${house.houseId || 'N/A'} • BEAT: ${house.beatNumber || 'Beat 01'}`, 50, y + 8);

  const statusText = `STATUS: ${(house.registrationStatus || 'REGISTERED').toUpperCase()}`;
  doc.fontSize(9.5).fillColor('#93c5fd').font(FONT_BOLD)
     .text(statusText, 400, y + 8, { width: 160, align: 'right' });

  y += 40;

  // --- Section 1: Property & Address Details ---
  doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
     .text('1. HOUSE PROPERTY & JURISDICTION SPECIFICATION / ಮನೆ ಮತ್ತು ವ್ಯಾಪ್ತಿ ವಿವರ', 40, y);
  doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

  y += 22;

  const col1X = 45;
  const col2X = 310;
  const rowHeight = 17;

  const propRows = [
    { label1: 'House Number / ಸಂಖ್ಯೆ:', val1: house.houseNumber || 'N/A', label2: 'Assigned Beat / ಬೀಟ್:', val2: house.beatNumber || 'Beat 01' },
    { label1: 'Street / ರಸ್ತೆ:', val1: house.streetName || 'N/A', label2: 'Village/Ward / ಗ್ರಾಮ:', val2: house.village || house.city || 'N/A' },
    { label1: 'Locality / ಬಡಾವಣೆ:', val1: house.locality || 'N/A', label2: 'House Type / ಮಾದರಿ:', val2: house.houseType || 'N/A' },
    { label1: 'Subdistrict/Taluk / ತಾಲೂಕು:', val1: house.subdistrict || 'N/A', label2: 'Floors/Rooms / ಕೊಠಡಿ:', val2: `${house.numberOfFloors || 1} Floor(s) / ${house.numberOfRooms || 1} Room(s)` },
    { label1: 'District & State / ಜಿಲ್ಲೆ:', val1: `${house.district || 'N/A'}, ${house.state || 'Karnataka'}`, label2: 'Ownership / ಹಕ್ಕು:', val2: house.ownershipType || 'N/A' },
    { label1: 'PIN Code / ಪಿನ್ ಕೋಡ್:', val1: house.pincode || 'N/A', label2: 'Survey Date / ದಿನಾಂಕ:', val2: house.registrationDate ? new Date(house.registrationDate).toLocaleDateString() : 'N/A' }
  ];

  doc.fontSize(8.5).font(FONT_REG);
  propRows.forEach((r) => {
    doc.fillColor(textMuted).font(FONT_BOLD).text(r.label1, col1X, y, { width: 115 });
    doc.fillColor(textDark).font(FONT_REG).text(r.val1, col1X + 120, y, { width: 135 });

    doc.fillColor(textMuted).font(FONT_BOLD).text(r.label2, col2X, y, { width: 115 });
    doc.fillColor(textDark).font(FONT_REG).text(r.val2, col2X + 120, y, { width: 135 });
    y += rowHeight;
  });

  y += 10;

  // --- Section 2: GPS Location & Geodetic Data ---
  doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
     .text('2. GPS GEOLOCATION & MAPPING COORDINATES / ಜಿಪಿಎಸ್ ಸ್ಥಳ ನಿರ್ದೇಶಾಂಕಗಳು', 40, y);
  doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

  y += 22;

  const hasLat = house.gps && house.gps.latitude !== undefined && house.gps.latitude !== '' && house.gps.latitude !== null && !isNaN(Number(house.gps.latitude));
  const hasLng = house.gps && house.gps.longitude !== undefined && house.gps.longitude !== '' && house.gps.longitude !== null && !isNaN(Number(house.gps.longitude));
  const lat = hasLat ? Number(house.gps.latitude).toFixed(6) : 'Not Captured (Optional)';
  const lng = hasLng ? Number(house.gps.longitude).toFixed(6) : 'Not Captured (Optional)';
  const acc = hasLat && house.gps.accuracy ? `${house.gps.accuracy} meters` : (hasLat ? 'Verified Fix' : 'Optional / Not Tagged');
  const gmapsUrl = hasLat && hasLng ? `https://www.google.com/maps?q=${lat},${lng}` : 'N/A';

  doc.fontSize(8.5);
  doc.fillColor(textMuted).font(FONT_BOLD).text('Latitude / ಅಕ್ಷಾಂಶ:', col1X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(lat, col1X + 120, y, { width: 135 });

  doc.fillColor(textMuted).font(FONT_BOLD).text('Longitude / ರೇಖಾಂಶ:', col2X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(lng, col2X + 120, y, { width: 135 });
  y += rowHeight;

  doc.fillColor(textMuted).font(FONT_BOLD).text('GPS Accuracy:', col1X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(acc, col1X + 120, y, { width: 135 });

  doc.fillColor(textMuted).font(FONT_BOLD).text('Google Maps:', col2X, y, { width: 115 });
  doc.fillColor(accentBlue).font(FONT_REG).text(gmapsUrl, col2X + 120, y, { width: 135, underline: hasLat });
  y += rowHeight + 10;

  // --- Section 3: Owner Information ---
  doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
     .text('3. REGISTERED HOUSE OWNER INFORMATION / ಮಾಲೀಕರ ಮಾಹಿತಿ', 40, y);
  doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

  y += 22;

  const owner = house.owner || {};
  doc.fontSize(8.5);
  doc.fillColor(textMuted).font(FONT_BOLD).text('Owner Name / ಹೆಸರು:', col1X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_BOLD).text(owner.fullName || 'Not recorded', col1X + 120, y, { width: 135 });

  doc.fillColor(textMuted).font(FONT_BOLD).text('Owner ID / ಐಡಿ:', col2X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(owner.ownerId || 'N/A', col2X + 120, y, { width: 135 });
  y += rowHeight;

  doc.fillColor(textMuted).font(FONT_BOLD).text('Contact / ದೂರವಾಣಿ:', col1X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(owner.contactNumber || 'N/A', col1X + 120, y, { width: 135 });

  doc.fillColor(textMuted).font(FONT_BOLD).text('Email / ಇಮೇಲ್:', col2X, y, { width: 115 });
  doc.fillColor(textDark).font(FONT_REG).text(owner.email || 'N/A', col2X + 120, y, { width: 135 });
  y += rowHeight;

  if (owner.correspondenceAddress) {
    doc.fillColor(textMuted).font(FONT_BOLD).text('Alt. Address / ವಿಳಾಸ:', col1X, y, { width: 115 });
    doc.fillColor(textDark).font(FONT_REG).text(owner.correspondenceAddress, col1X + 120, y, { width: 380 });
    y += rowHeight;
  }

  y += 10;

  // --- Section 4: Household & Family Members ---
  doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
     .text(`4. HOUSEHOLD & FAMILY MEMBERS / ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ (${(house.familyMembers && house.familyMembers.length) || 0} Registered)`, 40, y);
  doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

  y += 22;

  const family = house.familyMembers || [];

  // Table Header
  const tableX = 40;
  const colWidths = [30, 140, 95, 55, 55, 85, 72];
  const tableHeaders = ['#', 'Full Name / ಹೆಸರು', 'Relationship / ಸಂಬಂಧ', 'Age', 'Gender', 'Occupation / ಉದ್ಯೋಗ', 'Contact'];

  doc.rect(tableX, y, 532, 18).fill('#e2e8f0');
  doc.fillColor(primaryNavy).font(FONT_BOLD).fontSize(8);

  let curX = tableX + 5;
  tableHeaders.forEach((h, idx) => {
    doc.text(h, curX, y + 4, { width: colWidths[idx] });
    curX += colWidths[idx];
  });

  y += 20;

  if (family.length === 0) {
    doc.rect(tableX, y, 532, 18).strokeColor(borderColor).stroke();
    doc.fillColor(textMuted).font(FONT_OBLIQUE).fontSize(8)
       .text('No separate family members recorded for this registration.', tableX + 10, y + 4);
    y += 22;
  } else {
    family.forEach((m, idx) => {
      // Check page break
      if (y > 700) {
        doc.addPage();
        y = 40;
      }

      if (idx % 2 === 1) {
        doc.rect(tableX, y, 532, 18).fill('#f8fafc');
      }

      doc.fillColor(textDark).font(FONT_REG).fontSize(8);
      let rowX = tableX + 5;

      const cells = [
        `${idx + 1}`,
        m.fullName || 'N/A',
        m.relationship || 'N/A',
        m.age ? `${m.age} yrs` : 'N/A',
        m.gender || 'N/A',
        m.occupation || 'N/A',
        m.contactNumber || 'N/A'
      ];

      cells.forEach((c, cIdx) => {
        doc.text(c, rowX, y + 4, { width: colWidths[cIdx], ellipsis: true });
        rowX += colWidths[cIdx];
      });

      doc.moveTo(tableX, y + 18).lineTo(572, y + 18).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      y += 19;
    });
  }

  y += 10;

  // --- Section 5: Security & Issues Survey (ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಸಮಸ್ಯೆಗಳ ಸಮೀಕ್ಷೆ) ---
  if (y > 540) {
    doc.addPage();
    y = 45;
  }

  doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
     .text('5. SECURITY & ISSUES SURVEY / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಸಮಸ್ಯೆಗಳ ಸಮೀಕ್ಷೆ', 40, y);
  doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

  y += 22;

  // Security Present on Premises Summary Box
  doc.rect(40, y, 532, 24).fill('#f1f5f9');
  doc.fontSize(8);

  const cctv = house.security?.cctvInstalled === 'Yes' ? 'YES (Installed)' : 'NO';
  const guard = house.security?.securityGuardPresent === 'Yes' ? 'YES (Present)' : 'NO';
  const otherSec = house.security?.otherArrangements ? house.security.otherArrangements : 'None recorded';

  doc.fillColor(primaryNavy).font(FONT_BOLD).text('CCTV Installed / ಸಿಸಿಟಿವಿ:', 50, y + 6);
  doc.fillColor(house.security?.cctvInstalled === 'Yes' ? '#16a34a' : textDark).font(FONT_REG).text(cctv, 160, y + 6);

  doc.fillColor(primaryNavy).font(FONT_BOLD).text('Security Guard / ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ:', 240, y + 6);
  doc.fillColor(house.security?.securityGuardPresent === 'Yes' ? '#16a34a' : textDark).font(FONT_REG).text(guard, 370, y + 6);

  doc.fillColor(primaryNavy).font(FONT_BOLD).text('Other:', 430, y + 6);
  doc.fillColor(textDark).font(FONT_REG).text(otherSec, 465, y + 6, { width: 100, ellipsis: true });

  y += 32;

  // Issues and Suggestions Table
  const issuesList = house.issues || [];
  doc.fontSize(9).fillColor(secondaryNavy).font(FONT_BOLD)
     .text(`Issues & Suggestions Received / ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು (${issuesList.length} Logged):`, 40, y);

  y += 15;

  const issueColWidths = [25, 65, 80, 160, 135, 67];
  const issueHeaders = ['#', 'Date / ದಿನಾಂಕ', 'Category / ವರ್ಗ', 'Issue / Suggestion / ವಿವರ', 'Action Taken & Dept', 'Status / ಸ್ಥಿತಿ'];

  doc.rect(40, y, 532, 18).fill('#e2e8f0');
  doc.fillColor(primaryNavy).font(FONT_BOLD).fontSize(7.5);

  let issueHeaderX = 45;
  issueHeaders.forEach((h, idx) => {
    doc.text(h, issueHeaderX, y + 4, { width: issueColWidths[idx] });
    issueHeaderX += issueColWidths[idx];
  });

  y += 20;

  if (issuesList.length === 0) {
    doc.rect(40, y, 532, 18).strokeColor(borderColor).stroke();
    doc.fillColor(textMuted).font(FONT_OBLIQUE).fontSize(7.5)
       .text('No public issues or grievance suggestions recorded during this survey.', 50, y + 4);
    y += 24;
  } else {
    issuesList.forEach((iss, idx) => {
      if (y > 700) {
        doc.addPage();
        y = 45;
      }

      if (idx % 2 === 1) {
        doc.rect(40, y, 532, 20).fill('#f8fafc');
      }

      doc.fillColor(textDark).font(FONT_REG).fontSize(7.5);
      let curX = 45;

      const dateStr = iss.dateReported ? new Date(iss.dateReported).toLocaleDateString() : 'N/A';
      const catStr = iss.category || 'Police';
      const descStr = iss.description || 'N/A';
      const actionStr = iss.actionTaken ? `${iss.actionTaken} (${iss.responsibleDepartment || 'Dept'})` : `Awaiting review (${iss.responsibleDepartment || 'Dept'})`;
      const statusStr = (iss.status || 'Pending').toUpperCase();

      doc.text(`${idx + 1}`, curX, y + 4, { width: issueColWidths[0] });
      curX += issueColWidths[0];

      doc.text(dateStr, curX, y + 4, { width: issueColWidths[1] });
      curX += issueColWidths[1];

      doc.font(FONT_BOLD).text(catStr, curX, y + 4, { width: issueColWidths[2] });
      curX += issueColWidths[2];

      doc.font(FONT_REG).text(descStr, curX, y + 4, { width: issueColWidths[3], ellipsis: true });
      curX += issueColWidths[3];

      doc.text(actionStr, curX, y + 4, { width: issueColWidths[4], ellipsis: true });
      curX += issueColWidths[4];

      const statusColor = iss.status === 'Resolved' ? '#16a34a' : (iss.status === 'In Progress' ? '#2563eb' : '#d97706');
      doc.fillColor(statusColor).font(FONT_BOLD).text(statusStr, curX, y + 4, { width: issueColWidths[5] });

      doc.moveTo(40, y + 20).lineTo(572, y + 20).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      y += 22;
    });
  }

  y += 10;

  // --- Section 6: House Photographs (if any) ---
  const photos = house.photos || [];
  if (photos.length > 0) {
    if (y > 550) {
      doc.addPage();
      y = 45;
    }

    doc.fontSize(10.5).fillColor(secondaryNavy).font(FONT_BOLD)
       .text(`6. HOUSE PHOTOGRAPHS & ON-SITE IMAGERY / ಛಾಯಾಚಿತ್ರಗಳು (${photos.length} Captured)`, 40, y);
    doc.moveTo(40, y + 14).lineTo(572, y + 14).strokeColor(accentBlue).lineWidth(1.5).stroke();

    y += 22;

    const photoWidth = 120;
    const photoHeight = 90;
    let photoX = 40;

    for (let i = 0; i < Math.min(photos.length, 4); i++) {
      const p = photos[i];
      let imageRendered = false;

      if (p.filePath && fs.existsSync(p.filePath)) {
        try {
          doc.image(p.filePath, photoX, y, { width: photoWidth, height: photoHeight });
          imageRendered = true;
        } catch (imgErr) {
          console.error('Error embedding image in PDF:', imgErr.message);
        }
      }

      if (!imageRendered) {
        doc.rect(photoX, y, photoWidth, photoHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
        doc.fillColor(textMuted).fontSize(7.5).font(FONT_REG)
           .text(`[${p.category || 'Photo'}]`, photoX + 10, y + 35, { width: photoWidth - 20, align: 'center' });
      }

      // Caption
      doc.rect(photoX, y + photoHeight, photoWidth, 16).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(7.5).font(FONT_BOLD)
         .text(`${p.category || 'View'}`, photoX + 4, y + photoHeight + 4, { width: photoWidth - 8, align: 'center' });

      photoX += photoWidth + 14;
    }

    y += photoHeight + 30;
  }

  // --- Section 7: Remarks & Administrative Note ---
  if (house.remarks) {
    if (y > 700) {
      doc.addPage();
      y = 45;
    }
    doc.fontSize(8.5).fillColor(textMuted).font(FONT_BOLD).text('Remarks & Field Notes / ಷರಾ:', 40, y);
    doc.fontSize(8).fillColor(textDark).font(FONT_REG).text(house.remarks, 170, y, { width: 400 });
    y += 24;
  }

  // --- Verification Footer ---
  doc.fontSize(7.5).fillColor(primaryNavy).font(FONT_REG)
     .text('Karnataka State Police • ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ • Digital Verification Reference: ' + (house.houseId || 'KSP'), 48, 755, { align: 'center', width: 515 });
};

/**
 * Generate PDF stream for single house
 */
const generateSingleHousePDF = async (house, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  });

  setupDocFonts(doc);

  const filename = `House_Registration_${house.houseId || 'Report'}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  await buildHousePDFPage(doc, house, true);

  // Add page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(7.5).fillColor('#94a3b8').font(FONT_REG)
       .text(`Page ${i + 1} of ${totalPages}`, 40, 765, { width: 532, align: 'right' });
  }

  doc.end();
};

/**
 * Generate Bulk PDF for multiple houses
 */
const generateBulkHousePDF = async (houses, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  });

  setupDocFonts(doc);

  const filename = `House_Registrations_Bulk_${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  for (let i = 0; i < houses.length; i++) {
    await buildHousePDFPage(doc, houses[i], i === 0);
  }

  // Add page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(7.5).fillColor('#94a3b8').font(FONT_REG)
       .text(`Page ${i + 1} of ${totalPages}`, 40, 765, { width: 532, align: 'right' });
  }

  doc.end();
};

module.exports = { generateSingleHousePDF, generateBulkHousePDF };