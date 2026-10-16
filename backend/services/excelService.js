const ExcelJS = require('exceljs');

/**
 * Configure standard styling for worksheets: bold navy headers, zebra fills, borders, frozen header, auto-filter.
 */
const styleWorksheet = (worksheet, headers) => {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // Navy blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  const lastColLetter = String.fromCharCode(64 + headers.length);
  worksheet.autoFilter = {
    from: 'A1',
    to: `${lastColLetter}1`
  };
};

/**
 * Generate 4-sheet Excel workbook for single or bulk houses
 */
const generateHouseExcel = async (houses, res, filename = 'House_Registration_Export.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart House Registration System';
  workbook.lastModifiedBy = 'Municipal Registry';
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // Sheet 1: House Details
  // -------------------------------------------------------------
  const houseSheet = workbook.addWorksheet('House Details', {
    properties: { tabColor: { argb: 'FF1E3A8A' } }
  });

  const houseHeaders = [
    { header: 'House ID', key: 'houseId', width: 14 },
    { header: 'Beat Number', key: 'beatNumber', width: 14 },
    { header: 'Village / Ward', key: 'village', width: 22 },
    { header: 'House Number', key: 'houseNumber', width: 16 },
    { header: 'Street Name', key: 'streetName', width: 22 },
    { header: 'Locality', key: 'locality', width: 20 },
    { header: 'City / Village', key: 'city', width: 18 },
    { header: 'Subdistrict', key: 'subdistrict', width: 16 },
    { header: 'District', key: 'district', width: 16 },
    { header: 'State', key: 'state', width: 16 },
    { header: 'PIN Code', key: 'pincode', width: 12 },
    { header: 'House Type', key: 'houseType', width: 18 },
    { header: 'Floors', key: 'numberOfFloors', width: 10 },
    { header: 'Rooms', key: 'numberOfRooms', width: 10 },
    { header: 'Ownership Type', key: 'ownershipType', width: 16 },
    { header: 'CCTV Installed', key: 'cctvInstalled', width: 16 },
    { header: 'Security Guard', key: 'securityGuard', width: 16 },
    { header: 'Other Security Arrangements', key: 'otherSecurity', width: 25 },
    { header: 'Total Issues Logged', key: 'totalIssues', width: 18 },
    { header: 'Pending Issues', key: 'pendingIssues', width: 16 },
    { header: 'Latitude', key: 'latitude', width: 14 },
    { header: 'Longitude', key: 'longitude', width: 14 },
    { header: 'GPS Accuracy (m)', key: 'accuracy', width: 16 },
    { header: 'Registration Date', key: 'registrationDate', width: 18 },
    { header: 'Registration Status', key: 'status', width: 18 },
    { header: 'Remarks', key: 'remarks', width: 25 }
  ];

  houseSheet.columns = houseHeaders;
  styleWorksheet(houseSheet, houseHeaders);

  // -------------------------------------------------------------
  // Sheet 2: Owner Details
  // -------------------------------------------------------------
  const ownerSheet = workbook.addWorksheet('Owner Details', {
    properties: { tabColor: { argb: 'FF0284C7' } }
  });

  const ownerHeaders = [
    { header: 'House ID', key: 'houseId', width: 14 },
    { header: 'Owner ID', key: 'ownerId', width: 14 },
    { header: 'Owner Full Name', key: 'ownerName', width: 24 },
    { header: 'Contact Number', key: 'contactNumber', width: 18 },
    { header: 'Email Address', key: 'email', width: 25 },
    { header: 'Ownership Type', key: 'ownershipType', width: 16 },
    { header: 'Correspondence Address', key: 'correspondenceAddress', width: 30 },
    { header: 'Age', key: 'age', width: 10 },
    { header: 'ID Reference', key: 'idReference', width: 16 }
  ];

  ownerSheet.columns = ownerHeaders;
  styleWorksheet(ownerSheet, ownerHeaders);

  // -------------------------------------------------------------
  // Sheet 3: Family Details
  // -------------------------------------------------------------
  const familySheet = workbook.addWorksheet('Family Details', {
    properties: { tabColor: { argb: 'FF059669' } }
  });

  const familyHeaders = [
    { header: 'House ID', key: 'houseId', width: 14 },
    { header: 'Member ID', key: 'memberId', width: 14 },
    { header: 'Member Full Name', key: 'memberName', width: 24 },
    { header: 'Relationship', key: 'relationship', width: 18 },
    { header: 'Age', key: 'age', width: 10 },
    { header: 'Gender', key: 'gender', width: 14 },
    { header: 'Occupation', key: 'occupation', width: 20 },
    { header: 'Contact Number', key: 'contactNumber', width: 18 }
  ];

  familySheet.columns = familyHeaders;
  styleWorksheet(familySheet, familyHeaders);

  // -------------------------------------------------------------
  // Sheet 4: Photo References
  // -------------------------------------------------------------
  const photoSheet = workbook.addWorksheet('Photo References', {
    properties: { tabColor: { argb: 'FF7C3AED' } }
  });

  const photoHeaders = [
    { header: 'House ID', key: 'houseId', width: 14 },
    { header: 'Photo ID', key: 'photoId', width: 14 },
    { header: 'Photo Category', key: 'category', width: 18 },
    { header: 'Original Filename', key: 'originalName', width: 26 },
    { header: 'Safe Filename / Reference', key: 'filename', width: 32 },
    { header: 'File Size (KB)', key: 'fileSizeKB', width: 15 },
    { header: 'Upload Date', key: 'uploadDate', width: 18 }
  ];

  photoSheet.columns = photoHeaders;
  styleWorksheet(photoSheet, photoHeaders);

  // -------------------------------------------------------------
  // Sheet 5: Security & Issues Survey (ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಸಮಸ್ಯೆಗಳ ಸಮೀಕ್ಷೆ)
  // -------------------------------------------------------------
  const securitySheet = workbook.addWorksheet('Security & Issues', {
    properties: { tabColor: { argb: 'FFD97706' } }
  });

  const securityHeaders = [
    { header: 'House ID', key: 'houseId', width: 14 },
    { header: 'Beat Number', key: 'beatNumber', width: 14 },
    { header: 'Village / Ward', key: 'village', width: 22 },
    { header: 'House Number', key: 'houseNumber', width: 16 },
    { header: 'Owner Name', key: 'ownerName', width: 22 },
    { header: 'Owner Contact', key: 'ownerContact', width: 18 },
    { header: 'CCTV Installed', key: 'cctvInstalled', width: 16 },
    { header: 'Security Guard Present', key: 'securityGuard', width: 20 },
    { header: 'Other Security Arrangements', key: 'otherArrangements', width: 26 },
    { header: 'Issue ID', key: 'issueId', width: 16 },
    { header: 'Date Reported', key: 'dateReported', width: 16 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Issue / Suggestion Description', key: 'description', width: 35 },
    { header: 'Additional Remarks', key: 'additionalRemarks', width: 25 },
    { header: 'Reported By', key: 'reportedByName', width: 20 },
    { header: 'Responsible Department', key: 'responsibleDepartment', width: 24 },
    { header: 'Action Taken', key: 'actionTaken', width: 30 },
    { header: 'Action Date', key: 'actionDate', width: 16 },
    { header: 'Current Status', key: 'status', width: 16 },
    { header: 'Follow-up Remarks', key: 'followUpRemarks', width: 25 },
    { header: 'Action Updated By', key: 'actionUpdatedByName', width: 20 }
  ];

  securitySheet.columns = securityHeaders;
  styleWorksheet(securitySheet, securityHeaders);

  // Populate data across worksheets
  houses.forEach((h) => {
    // 1. Add House Row
    houseSheet.addRow({
      houseId: h.houseId || '',
      beatNumber: h.beatNumber || 'Beat 01',
      village: h.village || h.city || '',
      houseNumber: h.houseNumber || '',
      streetName: h.streetName || '',
      locality: h.locality || '',
      city: h.city || '',
      subdistrict: h.subdistrict || '',
      district: h.district || '',
      state: h.state || '',
      pincode: h.pincode || '',
      houseType: h.houseType || '',
      numberOfFloors: h.numberOfFloors || 1,
      numberOfRooms: h.numberOfRooms || 1,
      ownershipType: h.ownershipType || '',
      cctvInstalled: h.security?.cctvInstalled || 'No',
      securityGuard: h.security?.securityGuardPresent || 'No',
      otherSecurity: h.security?.otherArrangements || '',
      totalIssues: (h.issues && h.issues.length) || 0,
      pendingIssues: (h.issues || []).filter((i) => i.status === 'Pending').length,
      latitude: h.gps ? h.gps.latitude : '',
      longitude: h.gps ? h.gps.longitude : '',
      accuracy: h.gps ? h.gps.accuracy : '',
      registrationDate: h.registrationDate ? new Date(h.registrationDate).toLocaleDateString() : '',
      status: h.registrationStatus || 'Registered',
      remarks: h.remarks || ''
    });

    // 2. Add Owner Row
    if (h.owner) {
      ownerSheet.addRow({
        houseId: h.houseId || '',
        ownerId: h.owner.ownerId || '',
        ownerName: h.owner.fullName || '',
        contactNumber: h.owner.contactNumber || '',
        email: h.owner.email || '',
        ownershipType: h.owner.ownershipType || h.ownershipType || '',
        correspondenceAddress: h.owner.correspondenceAddress || '',
        age: h.owner.age || '',
        idReference: h.owner.idReference || ''
      });
    }

    // 3. Add Family Rows
    if (h.familyMembers && h.familyMembers.length > 0) {
      h.familyMembers.forEach((m) => {
        familySheet.addRow({
          houseId: h.houseId || '',
          memberId: m.memberId || '',
          memberName: m.fullName || '',
          relationship: m.relationship || '',
          age: m.age || '',
          gender: m.gender || '',
          occupation: m.occupation || '',
          contactNumber: m.contactNumber || ''
        });
      });
    }

    // 4. Add Photo Rows
    if (h.photos && h.photos.length > 0) {
      h.photos.forEach((p) => {
        photoSheet.addRow({
          houseId: h.houseId || '',
          photoId: p.photoId || '',
          category: p.category || '',
          originalName: p.originalName || '',
          filename: p.filename || '',
          fileSizeKB: p.fileSize ? Math.round(p.fileSize / 1024) : 0,
          uploadDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
        });
      });
    }

    // 5. Add Security & Issues Rows
    if (h.issues && h.issues.length > 0) {
      h.issues.forEach((iss) => {
        securitySheet.addRow({
          houseId: h.houseId || '',
          beatNumber: h.beatNumber || 'Beat 01',
          village: h.village || h.city || '',
          houseNumber: h.houseNumber || '',
          ownerName: h.owner?.fullName || 'N/A',
          ownerContact: h.owner?.contactNumber || 'N/A',
          cctvInstalled: h.security?.cctvInstalled || 'No',
          securityGuard: h.security?.securityGuardPresent || 'No',
          otherArrangements: h.security?.otherArrangements || '',
          issueId: iss.issueId || '',
          dateReported: iss.dateReported ? new Date(iss.dateReported).toLocaleDateString() : '',
          category: iss.category || 'Police-related',
          description: iss.description || '',
          additionalRemarks: iss.additionalRemarks || '',
          reportedByName: iss.reportedByName || '',
          responsibleDepartment: iss.responsibleDepartment || '',
          actionTaken: iss.actionTaken || '',
          actionDate: iss.actionDate ? new Date(iss.actionDate).toLocaleDateString() : '',
          status: iss.status || 'Pending',
          followUpRemarks: iss.followUpRemarks || '',
          actionUpdatedByName: iss.actionUpdatedByName || ''
        });
      });
    } else {
      securitySheet.addRow({
        houseId: h.houseId || '',
        beatNumber: h.beatNumber || 'Beat 01',
        village: h.village || h.city || '',
        houseNumber: h.houseNumber || '',
        ownerName: h.owner?.fullName || 'N/A',
        ownerContact: h.owner?.contactNumber || 'N/A',
        cctvInstalled: h.security?.cctvInstalled || 'No',
        securityGuard: h.security?.securityGuardPresent || 'No',
        otherArrangements: h.security?.otherArrangements || '',
        issueId: 'None',
        dateReported: '',
        category: '—',
        description: 'No issues or grievances recorded during survey',
        additionalRemarks: '',
        reportedByName: '',
        responsibleDepartment: '—',
        actionTaken: '—',
        actionDate: '',
        status: '—',
        followUpRemarks: '',
        actionUpdatedByName: ''
      });
    }
  });

  // Apply row styling and borders
  [houseSheet, ownerSheet, familySheet, photoSheet, securitySheet].forEach((ws) => {
    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.font = { name: 'Calibri', size: 10 };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
      }
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { generateHouseExcel };
