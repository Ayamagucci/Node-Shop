require('dotenv').config();
const { MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PW } =
  process.env;
const User = require('../models/User');
const { createTransport } = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const getFlashMsg = require('../util/getFlashMsg');
const findUserByToken = require('../util/findUserByToken');
const { ObjectId } = require('mongodb');

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
    const msg = getFlashMsg(req, 'error');
    res.status(200).render('auth/login', {
      pageTitle: 'User Login',
      path: '/login',
      msg
    });
  },
  async loginUser(req, res, next) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        req.flash('error', 'Invalid email or password!');
        return res.status(401).redirect('/login');
      }

      req.session.userId = user._id;
      await req.session.save();

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
    const msg = getFlashMsg(req, 'error');
    res.status(200).render('auth/register', {
      pageTitle: 'User Registration',
      path: '/register',
      msg
    });
  },
  async registerUser(req, res, next) {
    const { name, email, password, confirmPassword } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.flash('error', 'User already exists with that email!');
        return res.status(400).redirect('/register');
      }

      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match!');
        return res.status(400).redirect('/register');
      }

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

      res.status(201).redirect('/');
    } catch (err) {
      console.error('Error registering New User:', err);
      next(err);
    }
  },
  renderReset(req, res) {
    const errorMsg = getFlashMsg(req, 'error');
    const successMsg = getFlashMsg(req, 'success');

    res.status(200).render('auth/reset', {
      pageTitle: 'Password Reset',
      path: '/reset',
      errorMsg,
      successMsg
    });
  },
  sendResetToken(req, res, next) {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
      /* NOTE: each byte —> 8 bits / 2 hexadecimal chars
        • (bits): degree of randomness
        • (hexadecimal chars): length of resulting buffer
      */
      if (err) {
        console.error('Error generating Reset Token:', err);
        return next(err);
      }
      const resetToken = buffer.toString('hex'); // hexadecimal vals —> ASCII chars

      (async () => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            req.flash('error', 'No account found with that email!');
            return res.status(404).redirect('/reset');
          }

          // save user w/ reset token
          user.resetToken = resetToken;
          user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // expires after 1 hr
          await user.save();

          // send reset email
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
            'Please check your inbox (or spam folder) for a link to reset your password!'
          );
          res.status(302).redirect('/reset');
        } catch (err) {
          console.error('Error generating Reset Token:', err);
          next(err);
        }
      })();
    });
  },
  async renderChangePassword(req, res, next) {
    const errorMsg = getFlashMsg(req, 'error');
    const successMsg = getFlashMsg(req, 'success');

    const { resetToken } = req.params;
    try {
      const user = await findUserByToken(resetToken);
      if (!user) {
        req.flash(
          'error',
          'Reset Token has expired or is invalid — please submit another reset request!'
        );
        return res.status(400).redirect('/reset');
      }

      res.status(200).render('auth/changePassword', {
        pageTitle: 'Password Reset',
        path: '/reset',
        errorMsg,
        successMsg,
        userId: user._id,
        resetToken
      });
    } catch (err) {
      console.error('Error finding User for Reset Token:', err);
      next(err);
    }
  },
  async changePassword(req, res, next) {
    const { userId, newPassword, confirmPassword } = req.body;
    const { resetToken } = req.params;
    try {
      const user = await findUserByToken(resetToken, new ObjectId(userId));
      if (!user) {
        req.flash(
          'error',
          'Reset Token has expired or is invalid — please submit another reset request!'
        );
        return res.status(400).redirect('/reset');
      }

      if (newPassword !== confirmPassword) {
        req.flash('error', 'Passwords do not match!');
        return res.status(400).redirect(`/reset/${resetToken}`);
      }

      // set new password & clear token
      user.password = await bcrypt.hash(newPassword, 12);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      req.flash('success', 'Password successfully updated!');
      res.status(302).redirect('/reset');
    } catch (err) {
      console.error('Error changing User Password:', err);
      next(err);
    }
  }
};
