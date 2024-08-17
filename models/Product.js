// fully integrated w/ DB! **
const db = require('../util/db');

module.exports = class Product {
  constructor(id, title, imgURL, description, price) {
    this.id = id;
    this.title = title;
    this.imgURL = imgURL;
    this.description = description;
    this.price = price;
  }

  static async fetchAll() {
    try {
      const [products] = await db.execute('SELECT * FROM products');
      return products;
    } catch (err) {
      throw err;
    }
  }

  static async findByID(id) {
    try {
      const [product] = await db.execute(
        // query method that helps prevent SQL injection attacks **
        'SELECT * FROM products WHERE products.id = ?',
        [id]
      );
      return product[0];
    } catch (err) {
      throw err;
    }
  }

  static async deleteByID(id) {
    try {
      await db.execute('DELETE FROM products WHERE products.id = ?', [id]);
      return `Product w/ ID ${id} successfully deleted!`;
    } catch (err) {
      throw err;
    }
  }

  async save() {
    const { id, title, price, description, imgURL } = this;
    try {
      if (!id) {
        await db.execute(
          'INSERT INTO products (title, price, description, imgURL) VALUES (?, ?, ?, ?)',
          [title, price, description, imgURL]
        );
        return `Product (${title}) successfully added!`;
      } else {
        await db.execute(
          'UPDATE products SET title = ?, price = ?, description = ?, imgURL = ? WHERE id = ?',
          [title, price, description, imgURL, id]
        );
        return `Product (${title}) successfully edited!`;
      }
    } catch (err) {
      throw err;
    }
  }
};
