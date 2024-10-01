module.exports = (req, res, next) => {
  if (!req.loggedIn) {
    return res.redirect('/login');
  }
  next();
};
