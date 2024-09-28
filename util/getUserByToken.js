const User = require('../models/User');

module.exports = async (req, res, next) => {
  const { resetToken } = req.params;

  const user = await User.findOne({
    resetToken,
    resetTokenExpiry: { $gt: Date.now() } // validation
  });

  if (!user) {
    req.flash(
      'error',
      'Reset Token has expired or is invalid — please submit another reset request!'
    );
    return res.status(400).redirect('/reset');
  }

  req.user = user;
  next();
};
