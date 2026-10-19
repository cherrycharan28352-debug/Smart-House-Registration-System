const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'smart_house_secure_dev_jwt_key_2026_antigravity_token'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Account status enforcement
    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        accountStatus: 'pending',
        message: 'ನಿಮ್ಮ ಸಿಬ್ಬಂದಿ ಖಾತೆಯು ನಿರ್ವಾಹಕರ (Admin) ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ / Your account is pending administrator approval before you can access survey records.'
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        accountStatus: 'rejected',
        rejectionReason: user.rejectionReason,
        message: 'ನಿಮ್ಮ ಸಿಬ್ಬಂದಿ ಖಾತೆಯ ನೋಂದಣಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ / Your staff registration request has been rejected.'
      });
    }

    if (user.accountStatus === 'deactivated' || user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        accountStatus: 'deactivated',
        message: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ / Your account has been deactivated. Please contact an administrator.'
      });
    }

    if (user.accountStatus !== 'active' && user.accountStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account not authorized for access.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'smart_house_secure_dev_jwt_key_2026_antigravity_token'
    );
    const user = await User.findById(decoded.id).select('-password');
    if (user && (user.accountStatus === 'active' || user.accountStatus === 'approved')) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token on optional auth
  }
  next();
};

module.exports = { protect, authorize, optionalProtect };
