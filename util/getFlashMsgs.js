module.exports = (req, key) => {
  return req.flash(key).map((msg) => ({ msg }));
};
