const Product = require('../models/Product');
const Cart = require('../models/Cart');

module.exports = {
  // TODO: implement Cart.deleteProduct (in 'deleteProduct') **
  async renderAdminProducts(_, res) {
    try {
      const products = await Product.fetchAll();
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Admin Error', path: '' });
    }
  },
  renderAdder(_, res) {
    res.status(200).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
  },
  async renderEditor(req, res) {
    const editing = req.query.edit === 'true';
    const { id } = req.params;

    try {
      const product = await Product.findByID(id);
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        product
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Editor Error', path: '' });
    }
  },
  async addProduct(req, res) {
    const { title, imgURL, description, price } = req.body;
    const product = new Product(null, title, imgURL, description, +price);
    try {
      const msg = await product.save();
      console.log(msg);
      res.status(201).redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Adding Error', path: '' });
    }
  },
  async editProduct(req, res) {
    const { id, title, imgURL, description, price } = req.body;
    const product = new Product(id, title, imgURL, description, +price);
    try {
      const msg = await product.save();
      console.log(msg);
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Editing Error', path: '' });
    }
  },
  async deleteProduct(req, res) {
    const { id, price } = req.body;
    try {
      const msg = await Product.deleteByID(id);
      console.log(msg);

      // Cart.deleteProduct(id) **

      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render('error', { pageTitle: 'Deleting Error', path: '' });
    }
  }
};
