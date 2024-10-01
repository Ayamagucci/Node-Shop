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
const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const isAuth = require('../util/isAuth');
const getUserByToken = require('../util/getUserByToken');

router.get('/login', renderLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address!')
      .normalizeEmail(),
    body('password')
      .trim()
      .custom(async (password, { req }) => {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          throw new Error('Invalid email or password!');
        }
        req.user = user;
        return true;
      })
  ],
  loginUser
);
router.post('/logout', isAuth, logoutUser);

router.get('/register', renderRegister);
router.post(
  '/register',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address!')
      .normalizeEmail()
      .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists with that email!');
        }
        return true;
      }),
    body(
      'password',
      'Password must contain at least (4) alphanumeric characters!'
    )
      // .isStrongPassword({minLength: 4, minSymbols: 1, minUpperCase: 1})
      .trim()
      .isLength({ min: 4 })
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.password) {
          throw new Error('Passwords do not match!');
        }
        return true;
      })
  ],
  registerUser
);

router.get('/reset', renderReset);
router.post(
  '/reset',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address!')
    .bail() // stops validation chain if invalid email! **
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('No account found with that email!');
      }
      req.user = user;
      return true;
    }),
  sendResetToken
);

router.get('/reset/:resetToken', getUserByToken, renderChangePassword);
router.post(
  '/reset/:resetToken',
  [
    getUserByToken,
    body(
      'newPassword',
      'Password must contain at least (4) alphanumeric characters!'
    )
      .trim()
      .isLength({ min: 4 })
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.newPassword) {
          throw new Error('Passwords do not match!');
        }
        return true;
      })
  ],
  changePassword
);

module.exports = router;
