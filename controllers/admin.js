const { ObjectId } = require('mongoose').Types;
const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const getFlashMsgs = require('../util/getFlashMsgs');

module.exports = {
  async renderAdminProducts(req, res, next) {
    try {
      const products = await Product.find({ vendor: req.user._id });
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products,
        successMsg: getFlashMsgs(req, 'success')[0]?.msg,
        validationErrors: getFlashMsgs(req, 'error')
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
      editing: false,
      userInputs: { title: '', price: '', description: '', imgURL: '' },
      successMsg: getFlashMsgs(req, 'success')[0]?.msg,
      validationErrors: getFlashMsgs(req, 'error')
    });
  },
  async addProduct(req, res, next) {
    const { title, price, description, imgURL } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        userInputs: { title, price, description, imgURL },
        successMsg: '',
        validationErrors: errors.array()
      });
    }

    const product = new Product({
      title,
      price,
      description,
      imgURL,
      vendor: req.user._id
    });
    try {
      await product.save();

      req.flash('success', 'Product successfully added!');
      res.status(201).redirect('/admin/products');
    } catch (err) {
      console.error(`Error adding product (${title}):`, err);
      next(err);
    }
  },
  async renderEditor(req, res, next) {
    const editing = req.query.edit === 'true';
    const { productId } = req.params;
    try {
      const { title, price, description, imgURL } = await Product.findById(
        new ObjectId(productId)
      );
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        productId,
        userInputs: { title, price, description, imgURL },
        successMsg: getFlashMsgs(req, 'success')[0]?.msg,
        validationErrors: getFlashMsgs(req, 'error')
      });
    } catch (err) {
      console.error('Error rendering Edit Form:', err);
      next(err);
    }
  },
  async editProduct(req, res, next) {
    const { title, price, description, imgURL, productId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        productId,
        userInputs: { title, price, description, imgURL },
        successMsg: '',
        validationErrors: errors.array()
      });
    }
    try {
      await Product.findOneAndUpdate(
        { _id: new ObjectId(productId), vendor: req.user._id },
        { title, price, description, imgURL }
      );

      req.flash('success', 'Product successfully updated!');
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(`Error editing product (${title}):`, err);
      next(err);
    }
  },
  async deleteProduct(req, res, next) {
    const { productId } = req.body;
    const pId = new ObjectId(productId);
    try {
      await Product.findOneAndDelete({
        _id: pId,
        vendor: req.user._id
      });
      await User.updateMany(
        { 'cart.items.product': pId },
        { $pull: { 'cart.items': { product: pId } } }
      );

      req.flash('success', 'Product successfully deleted!');
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      next(err);
    }
  }
};
