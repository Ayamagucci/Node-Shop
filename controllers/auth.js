const User = require('../models/User');

module.exports = {
  renderLogin(req, res) {
    res.status(200).render('auth/login', {
      pageTitle: 'User Login',
      path: '/login',
      loggedIn: req.loggedIn
    });
  },
  async loginUser(req, res, next) {
    const { email, password } = req.body; // NOTE: will handle password after learning authentication
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw `User not found w/ email: ${email}`;
      }

      // cookies —> CLIENT-SIDE data storage **
      // res.cookie('user', JSON.stringify(user)); // https://expressjs.com/en/api.html#res.cookie
      // console.log('req.headers.cookie:', req.headers.cookie);

      /* NOTE: cookies have expiration dates
        • session cookies by default **
        • can pass options arg
         (e.g. 'maxAge' or 'expires' —> duration in ms)
      */

      /* sessions —> SERVER-SIDE data storage **
        (NOTE: cookie still used to assoc. session w/ given user/client!)
      */
      req.session.userId = user._id;
      // console.log('req.session:', req.session);

      // BONUS: prevents redirect from occurring before new session saved **
      await req.session.save();

      res.status(200).redirect('/');
    } catch (err) {
      console.error('Error logging in User:', err);
      return next(err);
    }
  },
  logoutUser(req, res, next) {
    // res.clearCookie('user'); // https://expressjs.com/en/api.html#res.clearCookie
    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
        return next(err);
      }
      res.status(200).redirect('/');
    });
  },
  renderRegister(req, res) {
    res.status(200).render('auth/register', {
      pageTitle: 'User Registration',
      path: '/register',
      loggedIn: req.loggedIn
    });
  },
  async registerUser(req, res, next) {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw `User already exists w/ email: ${email}`;
      }

      const newUser = new User({ name, email }); // default vals (cart schema) —> no need to explicitly pass empty cart **
      await newUser.save();

      req.session.userId = newUser._id;
      await req.session.save();

      res.status(201).redirect('/');
    } catch (err) {
      console.error('Error registering New User:', err);
      return next(err);
    }
  }
};
