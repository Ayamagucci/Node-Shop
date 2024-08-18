const { ObjectId } = require('mongodb');
const { getDB } = require('../util/db');
const Product = require('./Product');

module.exports = class User {
  constructor(name, email, id, cart) {
    this.name = name;
    this.email = email;
    this._id = id;
    this.cart = cart;
  }

  get id() {
    return new ObjectId(this._id); // streamlines code (NOTE: instance ID only!) **
  }

  static async findById(id) {
    try {
      const db = await getDB();
      return await db.collection('users').findOne({ _id: new ObjectId(id) });
    } catch (err) {
      throw err;
    }
  }

  async save() {
    try {
      const db = await getDB();
      await db.collection('users').insertOne(this);
    } catch (err) {
      throw err;
    }
  }

  async getCartItemData() {
    const cartItems = this.cart.items;

    const productIds = cartItems.map(({ productId }) => productId);
    if (productIds.length === 0) return [];

    try {
      const db = await getDB();
      const products = await db
        .collection('products')
        .find({ _id: { $in: productIds } }) // $in —> docs where val of assoc. field matches one found in array
        .toArray();
      return products.map((product) => {
        const quantity = cartItems.find(
          ({ productId }) =>
            // productId.toString() === product._id.toString() // NOTE: ObjectIds == reference types —> strict equality check (w/o conversion) fails! **
            productId.equals(product._id) // method specific to 'ObjectId' type
        ).quantity;
        return { ...product, quantity };
      });

      /*
      // NOTE: multiple async operations in parallel —> Promise.all()
      return await Promise.all(
        cartItems.map(async ({ productId, quantity }) => {
          const product = await Product.findByID(productId);
          return { ...product, quantity };
        })
      );
      */
    } catch (err) {
      throw err;
    }
  }

  async addToUserCart(product) {
    try {
      const db = await getDB();

      const cartProduct = this.cart.items.find(({ productId }) =>
        productId.equals(product._id)
      ); // NOTE: returns reference to elem (not copy!) **

      if (cartProduct) {
        await db.collection('users').updateOne(
          // nested fields —> wrap in quotes
          { _id: this.id, 'cart.items.productId': product._id },
          {
            // $inc —> increment val of specified field by given amount
            $inc: {
              'cart.items.$.quantity': 1, // $ —> first elem in array that matches (second) query condition
              'cart.totalPrice': product.price
            }
          }
        );
      } else {
        await db.collection('users').updateOne(
          { _id: this.id },
          {
            $push: { 'cart.items': { productId: product._id, quantity: 1 } },
            $inc: { 'cart.totalPrice': product.price }
          }
        );
      }
    } catch (err) {
      throw err;
    }

    /*
    let updatedItems = cartItems;
    if (cartProduct) {
      cartProduct.quantity++; // increments quantity of product directly in 'cartItems'
    } else {
      updatedItems = [...cartItems, { productId: product.id, quantity: 1 }];
    }
    const updatedCart = {
      items: updatedItems,
      totalPrice: this.cart.totalPrice + product.price
    };
    try {
      const db = await getDB();
      await db
        .collection('users')
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: updatedCart } }
        );
    } catch (err) {
      throw err;
    }
    */
  }

  async removeFromUserCart(product) {
    const cartItems = this.cart.items;

    const cartProduct = cartItems.find(({ productId }) =>
      productId.equals(product._id)
    );
    const priceReduction = cartProduct
      ? product.price * cartProduct.quantity
      : 0;

    const updatedItems = cartItems.filter(
      ({ productId }) => !productId.equals(product._id)
    );
    const updatedCart = {
      items: updatedItems,
      totalPrice: this.cart.totalPrice - priceReduction
    };
    try {
      const db = await getDB();
      await db
        .collection('users')
        .updateOne({ _id: this.id }, { $set: { cart: updatedCart } });
    } catch (err) {
      throw err;
    }
  }

  async getOrders() {
    try {
      const db = await getDB();
      return await db
        .collection('orders')
        .find({ 'customer.userId': this.id })
        .toArray();
    } catch (err) {
      throw err;
    }
  }

  async addOrder() {
    try {
      const db = await getDB();

      // transform data to include product & vendor details
      const productDetails = await this.getCartItemData();

      // (BONUS)
      // extract unique vendor IDs
      const vendorIds = [
        ...new Set(productDetails.map(({ vendorId }) => vendorId))
      ];

      // fetch all assoc. vendors at once
      const vendors = await db
        .collection('users')
        .find({ _id: { $in: vendorIds } })
        .toArray();

      // map product details to include vendor info
      const vendorMap = new Map(
        vendors.map((vendor) => [vendor._id.toString(), vendor])
        // [ [key1, val1], [key2, val2], ... ] —> { key1: val1, key2: val2, ... }
      );

      const products = productDetails.map(({ _id, vendorId, ...details }) => {
        const vendor = vendorMap.get(vendorId.toString()); // retrieve vendor via Map
        return {
          productId: _id,
          vendor: {
            userId: vendorId,
            name: vendor.name,
            email: vendor.email
          },
          ...details
        };
      });

      /*
      const products = await Promise.all(
        productDetails.map(async ({ _id, vendorId, ...details }) => {
          const vendor = await User.findById(vendorId.toString());
          return {
            productId: _id,
            vendor: {
              userId: vendor._id,
              name: vendor.name,
              email: vendor.email
            },
            ...details
          };
        })
      );
      */

      // insert into 'orders' collection
      const order = {
        items: products,
        customer: {
          userId: this.id,
          name: this.name,
          email: this.email
        },
        totalPrice: this.cart.totalPrice
      };
      await db.collection('orders').insertOne(order);

      // empty cart
      this.cart = { items: [], totalPrice: 0 };
      await db
        .collection('users')
        .updateOne({ _id: this.id }, { $set: { cart: this.cart } });
    } catch (err) {
      throw err;
    }
  }
};
