require('dotenv').config();
const { MODE, SERVER_PORT, DB_NAME, SESSION_SECRET } = process.env;
require('./util/db');
const path = require('path');
const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
  uri: `mongodb://localhost:27017/${DB_NAME}`,
  collection: 'sessions'
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store
  })
);
app.use(csurf());
app.use(flash());

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

app.use((req, res, next) => {
  res.locals.loggedIn = req.loggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use((err, req, res, _) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    pageTitle: err.name,
    path: '',
    message: err.message,
    stack: MODE === 'development' ? err.stack : undefined
  });
});

app.listen(SERVER_PORT, () => {
  console.log(`Server listening at PORT: ${SERVER_PORT}`);
});
