const Product = require('../models/Product');

module.exports = {
  renderAddProduct(_, res) {
    res.status(200).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product'
    });
  },
  addProduct(req, res) {
    const title = req.body.title;
    const imgURL = req.body.imgURL;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, imgURL, description, price);

    product.save(() => {
      res.status(302).redirect('/');
    });
  },
  getProducts(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    });
  }
};
