require('dotenv').config();
const { MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PW } =
  process.env;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const extractFlashMsgs = require('../util/extractFlashMsg');
const { createTransport } = require('nodemailer');

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
    const msg = extractFlashMsgs(req, 'error');
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
      return next(err);
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
    const msg = extractFlashMsgs(req, 'error');
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

      // send this message upon successful registration
      await transporter.sendMail({
        to: email,
        from: 'admin@shop.com', // dummy email
        subject: 'Registration Successful',
        text: `Congratulations, ${name}! You've successfully signed up!`
      });

      res.status(201).redirect('/');
    } catch (err) {
      console.error('Error registering New User:', err);
      return next(err);
    }
  }
};
