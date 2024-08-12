const Product = require('../models/Product');

module.exports = {
  renderShop(_, res) {
    // accounts for async nature of fs.readFile **
    Product.fetchAll((products) => {
      res.status(200).render('shop', {
        pageTitle: 'Shop',
        path: '/',
        products
      });
    });
  },
  renderError(_, res) {
    res.status(404).render('error', {
      pageTitle: 'Error',
      path: ''
    });
  },
  renderAddProduct(_, res) {
    res.status(200).render('add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product'
    });
  },
  addProduct(req, res) {
    const product = new Product(req.body.title);

    product.save(() => {
      res.status(201).redirect('/');
    });
  }
};
