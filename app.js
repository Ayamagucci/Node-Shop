// NOTE: Mongoose comes w/ 'mongodb' driver (vs. Sequelize + MySQL) **

require('./util/db');
const path = require('path');
const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, _, next) => {
  try {
    // NOTE: multiple users to test admin privileges
    req.user = await User.findById('66bd47a77873a3e45da36736');
    // req.user = await User.findById('66bd4a7e7873a3e45da3673d');
    // req.user = await User.findById('66bd4a8c7873a3e45da3673e');

    // console.log('User:', req.user);
  } catch (err) {
    console.error('Failed to find User:', err);
    return next(err);
  }
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// NOTE: (4) parameters req. for Express to recognize error-handling middleware **
app.use(({ name, message }, _, res, _2) => {
  res.status(500).render('error', {
    pageTitle: name,
    path: '',
    message
  });
});

app.listen(3000, () => {
  console.log(`Server listening at PORT: 3000`);
});
