const { MongoClient } = require('mongodb');

let _db; // stores connection

module.exports = {
  async mongoConnect(cb) {
    try {
      const client = await MongoClient.connect(
        'mongodb://localhost:27017/shop'
      ); // DB (& collections) do NOT need to be created in advance! **
      console.log('Successfully connected to MongoDB!');

      _db = client.db(); // NOTE: can also pass DB name here (vs. appending to URI)
      cb(client);
    } catch (err) {
      throw err;
    }
  },
  async getDB() {
    if (_db) {
      return _db;
    }
    throw 'MongoDB not found!';
  }
};
