const { ObjectId } = require('mongoose').Types;
const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  async renderAdminProducts(req, res, next) {
    try {
      const products = await Product.find({ vendor: req.user._id });
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    } catch (err) {
      console.error('Error rendering Admin Products:', err);
      next(err);
    }
  },
  renderAdder(req, res) {
    res.status(200).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
  },
  async renderEditor(req, res, next) {
    const editing = req.query.edit === 'true';
    const { id } = req.params;
    try {
      const product = await Product.findById(new ObjectId(id));
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        product
      });
    } catch (err) {
      console.error('Error rendering Edit Form:', err);
      next(err);
    }
  },
  async addProduct(req, res, next) {
    const { title, price, description, imgURL } = req.body;
    const product = new Product({
      title,
      price: +price,
      description,
      imgURL,
      vendor: req.user._id
    });
    try {
      await product.save();
      res.status(201).redirect('/');
    } catch (err) {
      console.error(`Error adding product (${title}):`, err);
      next(err);
    }
  },
  async editProduct(req, res, next) {
    const { title, price, description, imgURL, id } = req.body;
    try {
      await Product.findOneAndUpdate(
        { _id: new ObjectId(id), vendor: req.user._id },
        { title, price: +price, description, imgURL }
      );
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(`Error editing product (${title}):`, err);
      next(err);
    }
  },
  async deleteProduct(req, res, next) {
    const { id } = req.body;
    const productId = new ObjectId(id);
    try {
      await Product.findOneAndDelete({
        _id: productId,
        vendor: req.user._id
      });
      await User.updateMany(
        { 'cart.items.product': productId },
        { $pull: { 'cart.items': { product: productId } } }
      );
      await res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      next(err);
    }
  }
};
