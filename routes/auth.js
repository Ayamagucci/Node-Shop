const express = require('express');
const router = express.Router();
const {
  renderLogin,
  loginUser,
  renderRegister,
  registerUser,
  logoutUser
} = require('../controllers/auth');
const isAuth = require('../util/isAuth');

router.get('/login', renderLogin);
router.get('/register', renderRegister);

router.post('/login', loginUser);
router.post('/logout', isAuth, logoutUser);
router.post('/register', registerUser);

module.exports = router;
