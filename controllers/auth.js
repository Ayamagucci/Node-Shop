require('dotenv').config();
const { MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PW } =
  process.env;
const { createTransport } = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const getFlashMsgs = require('../util/getFlashMsgs');

const transporter = createTransport({
  host: MAILTRAP_HOST,
  port: MAILTRAP_PORT,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PW
  }
});

module.exports = {
  renderLogin(req, res) {
    res.status(200).render('auth/login', {
      pageTitle: 'User Login',
      path: '/login',
      userInputs: { email: '', password: '' },
      successMsg: getFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: getFlashMsgs(req, 'error')
    });
  },
  async loginUser(req, res, next) {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).render('auth/login', {
        pageTitle: 'User Login',
        path: '/login',
        userInputs: { email, password },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      const user = await User.findOne({ email });

      req.session.userId = req.user._id;
      await req.session.save();

      req.flash('success', 'Logged in successfully!');
      res.status(302).redirect('/');
    } catch (err) {
      console.error('Error logging in User:', err);
      next(err);
    }
  },
  logoutUser(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
        return next(err);
      }
      res.status(302).redirect('/');
    });
  },
  renderRegister(req, res) {
    res.status(200).render('auth/register', {
      pageTitle: 'User Registration',
      path: '/register',
      userInputs: { name: '', email: '', password: '', confirmPassword: '' },
      successMsg: getFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: getFlashMsgs(req, 'error')
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
    res.status(200).render('auth/reset', {
      pageTitle: 'Password Reset',
      path: '/reset',
      userInput: '',
      successMsg: getFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: getFlashMsgs(req, 'error')
    });
  },
  sendResetToken(req, res, next) {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).render('auth/reset', {
        pageTitle: 'Password Reset',
        path: '/reset',
        userInput: email,
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
          req.user.resetToken = resetToken;
          req.user.resetTokenExpiry = Date.now() + 1000 * 60 * 60;
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
          res.status(302).redirect('/reset');
        } catch (err) {
          console.error('Error generating Reset Token:', err);
          next(err);
        }
      })();
    });
  },
  renderChangePassword(req, res, next) {
    const { resetToken } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/reset', {
        pageTitle: 'Password Reset',
        path: '/reset',
        userInput: '',
        successMsg: '',
        validationErrors: errors.array()
      });
    }

    res.status(200).render('auth/changePassword', {
      pageTitle: 'Password Reset',
      path: '/reset',
      userId: req.user._id.toString(),
      resetToken,
      userInputs: { newPassword: '', confirmPassword: '' },
      successMsg: getFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: getFlashMsgs(req, 'error')
    });
  },
  async changePassword(req, res, next) {
    const { userId, newPassword, confirmPassword } = req.body;
    const { resetToken } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { msg } = errors.array()[0];

      if (
        msg ===
        'Reset Token has expired or is invalid — please submit another reset request!'
      ) {
        req.flash('error', msg);
        return res.status(400).redirect('/reset');
      }

      return res.status(400).render('auth/changePassword', {
        pageTitle: 'Password Reset',
        path: '/reset',
        userId,
        resetToken,
        userInputs: { newPassword, confirmPassword },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      req.user.password = await bcrypt.hash(newPassword, 12);
      req.user.resetToken = undefined;
      req.user.resetTokenExpiry = undefined;

      await req.user.save();

      req.flash('success', 'Password successfully updated!');
      res.status(302).redirect('/login');
    } catch (err) {
      console.error('Error changing User Password:', err);
      next(err);
    }
  }
};
