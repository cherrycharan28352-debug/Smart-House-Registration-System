const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateUserId } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all users with filtering by role and status
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      if (status === 'approved') {
        query.accountStatus = { $in: ['approved', 'active'] };
      } else {
        query.accountStatus = status;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
        { staffId: searchRegex },
        { mobileNumber: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'fullName staffId username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve a pending staff account and assign beats/villages
// @route   PUT /api/users/:id/approve
// @access  Private (Admin only)
exports.approveStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedBeats, assignedVillages } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.accountStatus = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = '';

    if (Array.isArray(assignedBeats)) {
      user.assignedBeats = assignedBeats;
    }
    if (Array.isArray(assignedVillages)) {
      user.assignedVillages = assignedVillages;
    }

    await user.save();

    // Log audit
    await logAuditEvent({
      action: 'STAFF_APPROVED',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: {
        staffId: user.staffId,
        assignedBeats: user.assignedBeats,
        assignedVillages: user.assignedVillages
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.status(200).json({
      success: true,
      message: `Staff member "${user.fullName}" approved successfully.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a staff account application
// @route   PUT /api/users/:id/reject
// @access  Private (Admin only)
exports.rejectStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.accountStatus = 'rejected';
    user.rejectionReason = reason ? reason.trim() : 'Application did not meet departmental verification criteria.';

    await user.save();

    // Log audit
    await logAuditEvent({
      action: 'STAFF_REJECTED',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: {
        staffId: user.staffId,
        reason: user.rejectionReason
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.status(200).json({
      success: true,
      message: `Staff application for "${user.fullName}" has been rejected.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle staff active / deactivated status
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
exports.updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'active', 'deactivated', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid account status specified.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security Alert: You cannot deactivate your own active administrator account.'
      });
    }

    user.accountStatus = status;
    await user.save();

    // Log audit
    await logAuditEvent({
      action: status === 'deactivated' ? 'STAFF_DEACTIVATED' : 'STAFF_ACTIVATED',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: {
        newStatus: status
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.status(200).json({
      success: true,
      message: `User "${user.fullName}" status updated to ${status}.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign beats and villages to staff
// @route   PUT /api/users/:id/assign
// @access  Private (Admin only)
exports.assignStaffJurisdiction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedBeats, assignedVillages } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (Array.isArray(assignedBeats)) {
      user.assignedBeats = assignedBeats;
    }
    if (Array.isArray(assignedVillages)) {
      user.assignedVillages = assignedVillages;
    }

    await user.save();

    // Log audit
    await logAuditEvent({
      action: 'STAFF_JURISDICTION_ASSIGNED',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: {
        assignedBeats: user.assignedBeats,
        assignedVillages: user.assignedVillages
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.status(200).json({
      success: true,
      message: `Jurisdiction updated for "${user.fullName}": ${user.assignedBeats.join(', ') || 'No beats assigned'}.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/users/audit-logs
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'fullName staffId username role')
      .populate('targetUser', 'fullName staffId username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: logs,
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

// @desc    Create new system user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, staffId, mobileNumber, role, accountStatus, assignedBeats } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required.'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that username or email address already exists.'
      });
    }

    const userId = await generateUserId();
    const user = new User({
      userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      staffId: staffId ? staffId.trim().toUpperCase() : '',
      mobileNumber: mobileNumber ? mobileNumber.trim() : '',
      role: role || 'staff',
      accountStatus: accountStatus || 'approved',
      assignedBeats: Array.isArray(assignedBeats) ? assignedBeats : []
    });

    await user.save();

    await logAuditEvent({
      action: 'ADMIN_CREATED_USER',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: { role: user.role, accountStatus: user.accountStatus },
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: `User account for ${user.fullName} created successfully.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details, role or status
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, staffId, mobileNumber, role, accountStatus, password, assignedBeats, assignedVillages } = req.body;

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (staffId !== undefined) user.staffId = staffId.trim().toUpperCase();
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
    if (role) user.role = role;
    if (accountStatus) user.accountStatus = accountStatus;
    if (Array.isArray(assignedBeats)) user.assignedBeats = assignedBeats;
    if (Array.isArray(assignedVillages)) user.assignedVillages = assignedVillages;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    await user.save();

    await logAuditEvent({
      action: 'ADMIN_UPDATED_USER',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetUser: user._id,
      targetUserName: user.fullName,
      targetResource: `User: ${user.userId}`,
      details: { role: user.role, accountStatus: user.accountStatus },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own logged-in administrator account.'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logAuditEvent({
      action: 'ADMIN_DELETED_USER',
      performedBy: req.user._id,
      performedByName: req.user.fullName,
      targetResource: `User: ${user.userId}`,
      details: { deletedUserName: user.fullName, deletedUserRole: user.role },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `User ${user.fullName} deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};
