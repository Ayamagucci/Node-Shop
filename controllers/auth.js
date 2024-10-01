require('dotenv').config();
const { MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PW } =
  process.env;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { createTransport } = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const convertFlashMsgs = require('../util/convertFlashMsgs');

const transporter = createTransport({
  host: MAILTRAP_HOST,
  port: MAILTRAP_PORT,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PW
  }
});

/* EXPLICIT STATUS CODES:
  • non-200 statuses
    (e.g. '201 Created', '400 Bad Request', etc.)

  • non-302 statuses for redirects
*/

module.exports = {
  renderLogin(req, res) {
    res.render('auth/login', {
      pageTitle: 'User Login',
      path: '/login',
      userInputs: { email: '', password: '' },
      successMsg: convertFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: convertFlashMsgs(req, 'error')
    });
  },
  async loginUser(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { email, password } = req.body;
      return res.status(401).render('auth/login', {
        pageTitle: 'User Login',
        path: '/login',
        userInputs: { email, password },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      req.session.userId = req.user._id;
      await req.session.save();

      req.flash('success', 'Logged in successfully!');
      res.redirect('/');
    } catch (err) {
      console.error('Error logging in User:', err);
      next(err);
    }
  },
  renderRegister(req, res) {
    res.render('auth/register', {
      pageTitle: 'User Registration',
      path: '/register',
      userInputs: { name: '', email: '', password: '', confirmPassword: '' },
      successMsg: convertFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: convertFlashMsgs(req, 'error')
    });
  },
  async registerUser(req, res, next) {
    const { name, email, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/register', {
        pageTitle: 'User Registration',
        path: '/register',
        userInputs: { name, email, password, confirmPassword },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      const newUser = new User({
        name,
        email,
        password: await bcrypt.hash(password, 12)
      });
      await newUser.save();

      req.session.userId = newUser._id;
      await req.session.save();

      await transporter.sendMail({
        to: email,
        from: 'admin@shop.com',
        subject: 'Registration Successful',
        text: `Congratulations, ${name}! You've successfully signed up!`
      });

      req.flash('success', 'Account successfully created!');
      res.status(201).redirect('/');
    } catch (err) {
      console.error('Error registering New User:', err);
      next(err);
    }
  },
  renderReset(req, res) {
    res.render('auth/reset', {
      pageTitle: 'Password Reset',
      path: '/reset',
      userInputs: { email: '' },
      successMsg: convertFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: convertFlashMsgs(req, 'error')
    });
  },
  sendResetToken(req, res, next) {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).render('auth/reset', {
        pageTitle: 'Password Reset',
        path: '/reset',
        userInputs: { email },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.error('Error generating Reset Token:', err);
        return next(err);
      }
      const resetToken = buffer.toString('hex');

      (async () => {
        try {
          req.user.resetToken = {
            value: resetToken,
            expiry: Date.now() + 1000 * 60 * 60
          };

          await req.user.save();

          await transporter.sendMail({
            to: email,
            from: 'admin@shop.com',
            subject: 'Password Reset',
            html: `
              <h3>You requested a password reset!</h3>
              <p>Click this <a href="http://localhost:3000/reset/${resetToken}">link</a> to set your new password.</p>
            `
          });

          req.flash(
            'success',
            'Please check your email for a link to reset your password!'
          );
          res.redirect('/reset');
        } catch (err) {
          console.error('Error generating Reset Token:', err);
          next(err);
        }
      })();
    });
  },
  renderChangePassword(req, res) {
    const { resetToken } = req.params;
    res.render('auth/changePassword', {
      pageTitle: 'Password Reset',
      path: '/reset',
      resetToken,
      userInputs: { newPassword: '', confirmPassword: '' },
      successMsg: convertFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: convertFlashMsgs(req, 'error')
    });
  },
  async changePassword(req, res, next) {
    const { newPassword, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { resetToken } = req.params;
      return res.status(400).render('auth/changePassword', {
        pageTitle: 'Password Reset',
        path: '/reset',
        resetToken,
        userInputs: { newPassword, confirmPassword },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      await req.user.updatePassword(newPassword);

      req.flash('success', 'Password successfully updated!');
      res.redirect('/login');
    } catch (err) {
      console.error('Error changing User Password:', err);
      next(err);
    }
  },
  logoutUser(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
        return next(err);
      }
      res.redirect('/');
    });
  }
};
