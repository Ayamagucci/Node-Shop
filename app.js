const path = require('path');
const express = require('express');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const { renderError } = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(renderError);

app.listen(3000, () => {
  console.log('Server listening at PORT: 3000');
});
