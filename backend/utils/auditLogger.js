const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative or security audit event
 */
const logAuditEvent = async ({
  action,
  performedBy,
  performedByName,
  targetUser,
  targetUserName,
  targetResource,
  details,
  ipAddress
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy: performedBy || null,
      performedByName: performedByName || '',
      targetUser: targetUser || null,
      targetUserName: targetUserName || '',
      targetResource: targetResource || '',
      details: details || {},
      ipAddress: ipAddress || ''
    });
  } catch (err) {
    // Audit logging failure should not crash main transaction, but log warning
    console.warn('[AuditLog] Failed to record audit entry:', err.message);
  }
};

module.exports = { logAuditEvent };
