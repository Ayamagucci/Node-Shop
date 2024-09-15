const User = require('../models/User');

module.exports = async (resetToken, userId) => {
  try {
    const query = {
      resetToken,
      resetTokenExpiry: { $gt: Date.now() }
    };
    if (userId) {
      query._id = userId;
    }
    return await User.findOne(query);
  } catch (err) {
    throw err;
  }
};
