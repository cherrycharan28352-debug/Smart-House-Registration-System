const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateUserId } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'smart_house_secure_dev_jwt_key_2026_antigravity_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      userId: user.userId,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      staffId: user.staffId || '',
      mobileNumber: user.mobileNumber || '',
      role: user.role,
      accountStatus: user.accountStatus,
      assignedBeats: user.assignedBeats || [],
      assignedVillages: user.assignedVillages || [],
      requestedBeat: user.requestedBeat || '',
      requestedVillage: user.requestedVillage || '',
      lastLogin: user.lastLogin
    }
  });
};

// @desc    Register new Field Staff Account (Self-Registration)
// @route   POST /api/auth/register-staff
// @access  Public
exports.registerStaff = async (req, res, next) => {
  try {
    const {
      fullName,
      staffId,
      mobileNumber,
      email,
      password,
      confirmPassword,
      requestedBeat,
      requestedVillage
    } = req.body;

    // 1. Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'ಪೂರ್ಣ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ / Full name is required.' });
    }

    if (!staffId || !staffId.trim()) {
      return res.status(400).json({ success: false, message: 'ಸಿಬ್ಬಂದಿ ಐಡಿ / ಬಿಲ್ಲೆ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯವಾಗಿದೆ / Staff ID is required.' });
    }

    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ success: false, message: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯವಾಗಿದೆ / Mobile number is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'ಇಮೇಲ್ ವಿಳಾಸ ಕಡ್ಡಾಯವಾಗಿದೆ / Email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು / Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ / Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStaffId = staffId.trim().toUpperCase();
    const cleanMobile = mobileNumber.trim();
    const generatedUsername = cleanStaffId.toLowerCase().replace(/[^a-z0-9]/g, '') || `staff_${Date.now()}`;

    // 2. Prevent duplicate accounts
    const existing = await User.findOne({
      $or: [
        { email: cleanEmail },
        { staffId: cleanStaffId },
        { username: generatedUsername },
        { mobileNumber: cleanMobile }
      ]
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(400).json({ success: false, message: 'ಈ ಇಮೇಲ್ ವಿಳಾಸದಲ್ಲಿ ಈಗಾಗಲೇ ಖಾತೆ ನೋಂದಣಿಯಾಗಿದೆ / An account with this email address already exists.' });
      }
      if (existing.staffId && existing.staffId.toUpperCase() === cleanStaffId) {
        return res.status(400).json({ success: false, message: 'ಈ ಸಿಬ್ಬಂದಿ ಐಡಿ (Staff ID) ಈಗಾಗಲೇ ನೋಂದಣಿಯಾಗಿದೆ / An account with this Staff ID already exists.' });
      }
      if (existing.mobileNumber && existing.mobileNumber === cleanMobile) {
        return res.status(400).json({ success: false, message: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಖಾತೆ ನೋಂದಣಿಯಾಗಿದೆ / An account with this mobile number already exists.' });
      }
      return res.status(400).json({ success: false, message: 'ಬಳಕೆದಾರ ಖಾತೆ ಈಗಾಗಲೇ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ / Duplicate account detected.' });
    }

    // 3. Create staff account with role strictly forced to 'staff' and status 'pending'
    const userId = await generateUserId();
    const newStaff = new User({
      userId,
      username: generatedUsername,
      email: cleanEmail,
      mobileNumber: cleanMobile,
      staffId: cleanStaffId,
      fullName: fullName.trim(),
      password, // Will be bcrypt-hashed via pre('save')
      role: 'staff', // Forced on server
      accountStatus: 'pending', // Requires admin approval
      assignedBeats: [],
      assignedVillages: [],
      requestedBeat: requestedBeat ? requestedBeat.trim() : '',
      requestedVillage: requestedVillage ? requestedVillage.trim() : ''
    });

    await newStaff.save();

    // 4. Log audit event
    await logAuditEvent({
      action: 'STAFF_REGISTERED',
      performedBy: newStaff._id,
      performedByName: newStaff.fullName,
      targetUser: newStaff._id,
      targetUserName: newStaff.fullName,
      targetResource: `User: ${newStaff.userId}`,
      details: {
        staffId: cleanStaffId,
        email: cleanEmail,
        requestedBeat: requestedBeat || 'None',
        requestedVillage: requestedVillage || 'None'
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.status(201).json({
      success: true,
      message: 'ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ. ನಿಮ್ಮ ಖಾತೆಯು ನಿರ್ವಾಹಕರ (Admin) ಪರಿಶೀಲನೆ ಮತ್ತು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ. ಅನುಮೋದನೆಯ ನಂತರ ನೀವು ಲಾಗಿನ್ ಆಗಬಹುದು.',
      accountStatus: 'pending',
      data: {
        userId: newStaff.userId,
        fullName: newStaff.fullName,
        staffId: newStaff.staffId,
        email: newStaff.email,
        accountStatus: 'pending'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & get token (supports separate admin & staff portals)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password, portalType } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'ದಯವಿಟ್ಟು ಬಳಕೆದಾರ ಹೆಸರು/ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ / Please provide username/email/staff ID and password.'
      });
    }

    const cleanIdentifier = username.trim().toLowerCase();

    // Support login with username, email, or staffId
    const user = await User.findOne({
      $or: [
        { username: cleanIdentifier },
        { email: cleanIdentifier },
        { staffId: cleanIdentifier.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ ಅಥವಾ ವಿವರಗಳು ತಪ್ಪಾಗಿವೆ / Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್ / Incorrect password.'
      });
    }

    // Portal segregation check
    if (portalType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ: ಈ ಪೋರ್ಟಲ್ ಕೇವಲ ಪೊಲೀಸ್ ನಿರ್ವಾಹಕರಿಗೆ (Admin) ಮಾತ್ರ ಮೀಸಲಾಗಿದೆ. ಸಿಬ್ಬಂದಿಗಳು ದಯವಿಟ್ಟು "ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್" ಆಯ್ಕೆಯನ್ನು ಬಳಸಿ / Access Denied: This portal is strictly for Police Administrators. Staff members must use Staff Login.'
      });
    }

    // Account status check
    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        accountStatus: 'pending',
        message: 'ನಿಮ್ಮ ಸಿಬ್ಬಂದಿ ಖಾತೆಯು ನಿರ್ವಾಹಕರ (Admin) ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ. ಅನುಮೋದನೆಯ ನಂತರ ಮಾತ್ರ ಪ್ರವೇಶ ಲಭ್ಯವಿರುತ್ತದೆ / Your staff account is pending administrator approval before you can access survey records.',
        user: {
          fullName: user.fullName,
          staffId: user.staffId,
          email: user.email,
          accountStatus: 'pending'
        }
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        accountStatus: 'rejected',
        rejectionReason: user.rejectionReason,
        message: `ನಿಮ್ಮ ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ ಅರ್ಜಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ${user.rejectionReason ? ': ' + user.rejectionReason : ''} / Your staff account application was rejected.`
      });
    }

    if (user.accountStatus === 'deactivated' || user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        accountStatus: 'deactivated',
        message: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ನಿರ್ವಾಹಕರು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿದ್ದಾರೆ / Your account has been deactivated. Please contact police station administrator.'
      });
    }

    if (user.accountStatus !== 'active' && user.accountStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'ಖಾತೆಯ ಸ್ಥಿತಿ ಮಾನ್ಯವಾಗಿಲ್ಲ / Account is not authorized.'
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Log login audit
    await logAuditEvent({
      action: user.role === 'admin' ? 'ADMIN_LOGGED_IN' : 'STAFF_LOGGED_IN',
      performedBy: user._id,
      performedByName: user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: {
        role: user.role,
        portalType: portalType || 'default'
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Change current user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};
