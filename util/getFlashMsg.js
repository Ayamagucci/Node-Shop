module.exports = (req, key) => {
  const msgs = req.flash(key);
  return msgs.length > 0 ? msgs[0] : null;
};
