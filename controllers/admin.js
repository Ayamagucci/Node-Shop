const Product = require('../models/Product');

module.exports = {
  async renderAdminProducts(req, res) {
    try {
      const products = await Product.findAll({ vendorId: req.user._id });
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    } catch (err) {
      console.error('Error rendering Admin Products:', err);
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
      const product = await Product.findById(id);
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        product
      });
    } catch (err) {
      console.error('Error rendering Edit Form:', err);
      res.status(500).render('error', { pageTitle: 'Editor Error', path: '' });
    }
  },
  async addProduct(req, res) {
    const { title, price, description, imgURL } = req.body;
    const product = new Product(
      title,
      +price,
      description,
      imgURL,
      null, // no productId —> new product
      req.user._id
    );
    try {
      await product.save();
      res.status(201).redirect('/');
    } catch (err) {
      console.error(`Error adding product (${title}):`, err);
      res.status(500).render('error', { pageTitle: 'Adding Error', path: '' });
    }
  },
  async editProduct(req, res) {
    const { title, price, description, imgURL, id } = req.body;
    const product = new Product(
      title,
      +price,
      description,
      imgURL,
      id, // productId —> existing product
      req.user._id
    );
    try {
      await product.save();
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(`Error editing product (${title}):`, err);
      res.status(500).render('error', { pageTitle: 'Editing Error', path: '' });
    }
  },
  async deleteProduct(req, res) {
    const { id } = req.body;
    try {
      const product = await Product.findById(id);

      await Product.deleteById(id); // delete product from collection
      await req.user.removeFromUserCart(product); // remove product from cart

      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      res
        .status(500)
        .render('error', { pageTitle: 'Deletion Error', path: '' });
    }
  }
};
