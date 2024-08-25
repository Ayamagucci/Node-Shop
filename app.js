require('dotenv').config();
const { MODE, PORT, DB_NAME } = process.env;
require('./util/db');
const path = require('path');
const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

// const getCookies = require('./util/getCookies');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); // session passed into imported middleware —> new constructor returned

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/' + DB_NAME,
  collection: 'sessions' // creates new collection
});

app.use(
  session({
    secret: 'my secret',
    resave: false, // whether to save session on every req
    saveUninitialized: false, // whether to save new session despite no mods
    store
  })
);

app.use(async (req, _, next) => {
  const { userId } = req.session;
  if (userId) {
    try {
      req.user = await User.findById(userId);
    } catch (err) {
      console.error('Error fetching user data for session:', err);
      return next(err);
    }
    req.loggedIn = true;
  } else {
    req.loggedIn = false;
  }
  next();
});

/*
app.use(async (req, _, next) => {
  try {
    const cookieUser = getCookies(req, 'user');

    if (cookieUser) {
      const userId = JSON.parse(decodeURIComponent(cookieUser[1]))._id;

      // rehydrate req.user as User instance —> model methods **
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        req.loggedIn = true;
      }
    } else {
      req.loggedIn = false;
    }

    // console.log('req.user:', req.user);
    // console.log('req.loggedIn:', req.loggedIn);

    // NOTE: can edit cookies via DevTools —> avoid passing sensitive data! **
  } catch (err) {
    console.error('Failed to find User:', err);
    return next(err);
  }
  next();
});
*/

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(({ name, message, stack }, req, res, _) => {
  res.status(500).render('error', {
    pageTitle: name,
    path: '',
    loggedIn: req.loggedIn,
    message,
    stack: MODE === 'development' ? stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at PORT: ${PORT}`);
});
