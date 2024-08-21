const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shop');
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    throw err;
  }
})();

module.exports = mongoose;
