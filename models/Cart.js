// interacts w/ cart.json file **
const fs = require('fs');
const { cartPath } = require('../util/path');

const readCart = (cb) => {
  fs.readFile(cartPath, (err, content) => {
    if (err || !content) {
      console.warn(
        `Error reading cart.json or empty content. Initializing new cart...`
      );
      cb({ products: [], totalPrice: 0 });
    } else {
      cb(JSON.parse(content));
    }
  });
};
const writeCart = (cart, cb) => {
  fs.writeFile(cartPath, JSON.stringify(cart), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    if (cb) cb(); // ensures cb always execs after writing file **
  });
};

module.exports = class Cart {
  static fetchAll(cb) {
    readCart(cb);
  }

  static addProduct(id, price, cb) {
    // fetch current cart
    readCart((cart) => {
      // check for existing product
      const existingIndex = cart.products.findIndex(
        (product) => product.id === id
      );
      const existingProduct = cart.products[existingIndex];

      // add new product / increase quantity
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + 1
        };
        cart.products[existingIndex] = updatedProduct;
      } else {
        updatedProduct = { id, quantity: 1 };
        cart.products.push(updatedProduct);
      }
      cart.totalPrice += +price; // NOTE: ensure each price converted to num before adding

      // update cart file
      writeCart(cart, cb);
    });
  }

  static deleteProduct(id, price, cb) {
    // fetch current cart
    readCart((cart) => {
      // check if product in cart
      const product = cart.products.find((prod) => prod.id === id);
      if (!product) {
        console.warn(`No product w/ ID ${id} found in cart!`);
        return;
      }
      // update total price
      const { quantity } = product;
      cart.totalPrice -= price * quantity;

      // update cart
      cart.products = cart.products.filter((product) => product.id !== id);

      // update cart file
      writeCart(cart, cb);
    });
  }
};
