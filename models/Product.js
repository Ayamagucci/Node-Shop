const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const dataPath = path.join(rootDir, 'data', 'products.json');

const readProducts = (cb) => {
  fs.readFile(dataPath, (err, content) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(content));
    }
  });
};

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save(cb) {
    readProducts((products) => {
      // pushes instance into empty array OR parsed array
      products.push(this); // NOTE: (this == instance) since arrow fn!

      // stringifies array —> writes to file
      fs.writeFile(dataPath, JSON.stringify(products), (err) => {
        if (err) console.error(err);
        if (cb) cb(); // redirects afterwards
      });
    });
  }

  static fetchAll(cb) {
    readProducts(cb);
  }
};
