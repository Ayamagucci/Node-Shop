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
  constructor(title, imgURL, description, price) {
    this.title = title;
    this.imgURL = imgURL;
    this.description = description;
    this.price = price;
  }

  save(cb) {
    readProducts((products) => {
      products.push(this);

      fs.writeFile(dataPath, JSON.stringify(products), (err) => {
        if (err) console.error(err);
        if (cb) cb(); // ensures redirect happens only after writing file
      });
    });
  }

  static fetchAll(cb) {
    readProducts(cb);
  }
};
