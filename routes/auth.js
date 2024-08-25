const express = require('express');
const router = express.Router();
const {
  renderLogin,
  loginUser,
  renderRegister,
  registerUser,
  logoutUser
} = require('../controllers/auth');

router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.get('/logout', logoutUser);

router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;
