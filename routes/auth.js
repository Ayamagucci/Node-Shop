const express = require('express');
const router = express.Router();
const {
  renderLogin,
  loginUser,
  logoutUser,
  renderRegister,
  registerUser,
  renderReset,
  sendResetToken,
  renderChangePassword,
  changePassword
} = require('../controllers/auth');
const isAuth = require('../util/isAuth');

router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.get('/reset', renderReset);
router.get('/reset/:resetToken', renderChangePassword);

router.post('/login', loginUser);
router.post('/logout', isAuth, logoutUser);
router.post('/register', registerUser);
router.post('/reset', sendResetToken);
router.post('/reset/:resetToken', changePassword);

module.exports = router;
