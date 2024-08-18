const path = require('path');
const express = require('express');
const { mongoConnect } = require('./util/db');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const renderError = require('./controllers/error');
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, _, next) => {
  try {
    const { name, email, _id, cart } = await User.findById(
      '66bbf93c7873a3e45da366df'
      /* NOTE: manually created doc via Compass
        • anticipate need to update on future review
        • cart may not render correctly
      */
    );
    req.user = new User(name, email, _id, cart); // provides access to User model methods **
  } catch (err) {
    throw err;
  }
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(renderError);

mongoConnect(() => {
  app.listen(3000, () => {
    console.log(`Server listening at PORT: 3000`);
  });
});
