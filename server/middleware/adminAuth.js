const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Get user from auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Authorization denied' });
    }

    // Check if user is admin
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    next();
  } catch (err) {
    console.error('Error in admin authorization:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
}; 