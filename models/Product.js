const { ObjectId } = require('mongodb'); // special type for document IDs **
const { getDB } = require('../util/db');

module.exports = class Product {
  constructor(title, price, description, imgURL, productId, vendorId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imgURL = imgURL;
    this._id = productId ? new ObjectId(productId) : null;
    this.vendorId = vendorId;
  }

  static async findAll(query = {}) {
    try {
      const db = await getDB();
      return await db.collection('products').find(query).toArray(); // NOTE: find() —> iterable "cursor"
    } catch (err) {
      throw err;
    }
  }

  static async findById(id) {
    try {
      const db = await getDB();
      return await db
        .collection('products')
        .find({ _id: new ObjectId(id) })
        .next();
    } catch (err) {
      throw err;
    }
  }

  static async deleteById(id) {
    try {
      const db = await getDB();
      await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      throw err;
    }
  }

  async save() {
    try {
      const db = await getDB();
      if (this._id) {
        await db
          .collection('products')
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        await db.collection('products').insertOne(this);
      }
    } catch (err) {
      throw err;
    }
  }
};
