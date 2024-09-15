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
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, body, param } = require('express-validator');
const findUserByToken = require('../util/findUserByToken');
const { ObjectId } = require('mongoose').Types;

router.get('/login', renderLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address!')
      .normalizeEmail()
      .custom(async (email, { req }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid email or password!');
        }
        req.user = user;
        return true;
      }),
    body('password')
      .trim()
      // .isStrongPassword({minLength: 4, minSymbols: 1, minUpperCase: 1})
      .custom(async (password, { req }) => {
        if (!req.user || !(await bcrypt.compare(password, req.user.password))) {
          throw new Error('Invalid email or password!');
        }
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
      .trim()
      .isAlphanumeric()
      .isLength({ min: 4 }),
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

router.get(
  '/reset/:resetToken',
  param('resetToken').custom(async (resetToken, { req }) => {
    const user = await findUserByToken(resetToken);
    if (!user) {
      throw new Error(
        'Reset Token has expired or is invalid — please submit another reset request!'
      );
    }
    req.user = user;
    return true;
  }),
  renderChangePassword
);
router.post(
  '/reset/:resetToken',
  [
    body('userId')
      .isString()
      .custom(async (userId, { req }) => {
        const user = await findUserByToken(
          req.params.resetToken,
          new ObjectId(userId)
        );
        if (!user) {
          throw new Error(
            'Reset Token has expired or is invalid — please submit another reset request!'
          );
        }
        req.user = user;
        return true;
      }),
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
