module.exports = (req, res, next) => {
  if (!req.loggedIn) {
    return res.status(302).redirect('/login');
  }
  next();
};
