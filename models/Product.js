// interacts w/ products.json file **
const fs = require('fs');
const { productsPath } = require('../util/path');

const readProducts = (cb) => {
  fs.readFile(productsPath, (err, content) => {
    if (err || !content) {
      console.warn(
        `Error reading products.json or empty content. Initializing new cart...`
      );
      cb([]);
    } else {
      cb(JSON.parse(content));
    }
  });
};
const writeProducts = (products, cb) => {
  fs.writeFile(productsPath, JSON.stringify(products), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    if (cb) cb(); // ensures cb always execs after writing file **
  });
};

module.exports = class Product {
  constructor(id, title, imgURL, description, price) {
    this.id = id;
    this.title = title;
    this.imgURL = imgURL;
    this.description = description;
    this.price = price;
  }

  static fetchAll(cb) {
    readProducts(cb);
  }

  static findByID(id, cb) {
    readProducts((products) => {
      const product = products.find((prod) => prod.id === id);
      if (!product) {
        console.warn(`No product w/ ID ${id} found!`);
        return;
      }
      if (cb) cb(product);
    });
  }

  static deleteByID(id, cb) {
    readProducts((products) => {
      const product = products.find((prod) => prod.id === id);
      if (!product) {
        console.warn(`No product w/ ID ${id} found!`);
        return;
      }
      const updatedProducts = products.filter((product) => product.id !== id);
      writeProducts(updatedProducts, cb);
    });
  }

  save(cb) {
    readProducts((products) => {
      if (this.id) {
        const existingIndex = products.findIndex(
          (product) => product.id === this.id
        );
        if (existingIndex >= 0) {
          products[existingIndex] = this;
        } else {
          console.warn(`Product w/ ID ${this.id} not found!`);
          if (cb) cb(null);
          return;
        }
      } else {
        this.id = Math.random().toString();
        products.push(this);
      }
      writeProducts(products, cb);
    });
  }
};
