const path = require('path');
const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();
app.use(express.urlencoded({ extended: false })); // parses reqs w/ URL-encoded payloads (default encoding type for HTML forms)

app.use(express.static(path.join(__dirname, 'public')));
// NOTE: can serve multiple static folders —> file lookups resolve to first match **

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((_, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', 'error.html'));
});

const server = app.listen(3000, () => {
  console.log('Server listening at PORT: 3000');
});
