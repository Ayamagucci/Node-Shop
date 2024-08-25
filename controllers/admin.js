const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  async renderAdminProducts(req, res, next) {
    try {
      const products = await Product.find({ vendor: req.user.id });
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        loggedIn: req.loggedIn,
        products
      });
    } catch (err) {
      console.error('Error rendering Admin Products:', err);
      return next(err);
    }
  },
  renderAdder(req, res) {
    res.status(200).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      loggedIn: req.loggedIn,
      editing: false
    });
  },
  async renderEditor(req, res, next) {
    const editing = req.query.edit === 'true';
    const { id } = req.params;
    try {
      const product = await Product.findById(id);
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        loggedIn: req.loggedIn,
        editing,
        product
      });
    } catch (err) {
      console.error('Error rendering Edit Form:', err);
      return next(err);
    }
  },
  async addProduct(req, res, next) {
    const { title, price, description, imgURL } = req.body;
    const product = new Product({
      title,
      price: +price,
      description,
      imgURL,
      vendor: req.user.id
    });
    try {
      await product.save();
      res.status(201).redirect('/');
    } catch (err) {
      console.error(`Error adding product (${title}):`, err);
      return next(err);
    }
  },
  async editProduct(req, res, next) {
    const { title, price, description, imgURL, id } = req.body;
    try {
      await Product.findByIdAndUpdate(id, {
        title,
        price: +price,
        description,
        imgURL
      });
      res.status(200).redirect('/admin/products');
    } catch (err) {
      console.error(`Error editing product (${title}):`, err);
      return next(err);
    }
  },
  async deleteProduct(req, res, next) {
    const { id } = req.body;
    try {
      await Product.findByIdAndDelete(id);
      await User.updateMany(
        { 'cart.items.product': id },
        { $pull: { 'cart.items': { product: id } } }
      );
      await res.status(204).redirect('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      return next(err);
    }
  }
};
