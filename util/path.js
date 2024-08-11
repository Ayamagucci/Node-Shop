const path = require('path');

// main == module that starts app (app.js)
module.exports = path.dirname(require.main.filename);
