const path = require('path');
const express = require('express');
const shopRoutes = require('./routes/shop');
const { adminRoutes } = require('./routes/admin');

const app = express();

// APP.SET —> GLOBAL CONFIG **

/* PUG
app.set('view engine', 'pug');
app.set('views', 'views/pug');
*/

/* HANDLEBARS
const { engine } = require('express-handlebars');

app.engine('handlebars', engine()); // NOTE: must first define engine!
app.set('view engine', 'handlebars');
app.set('views', 'views/hbs');
*/

// EJS
app.set('view engine', 'ejs');
app.set('views', 'views/ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((_, res) => {
  res.status(404).render('error', { pageTitle: 'Error', path: '' });
});

const server = app.listen(3000, () => {
  console.log('Server listening at PORT: 3000');
});
