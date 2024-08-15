const Product = require('../models/Product');
const Cart = require('../models/Cart');

module.exports = {
  renderAdminProducts(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    });
  },
  renderAdder(_, res) {
    res.status(200).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
  },
  renderEditor(req, res) {
    // NOTE: extracted vals always strs (or undefined) **
    const editing = req.query.edit === 'true';
    const { id } = req.params;

    Product.findByID(id, (product) => {
      res.status(200).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        product
      });
    });
  },
  addProduct(req, res) {
    const { title, imgURL, description, price } = req.body;
    const product = new Product(null, title, imgURL, description, +price);

    // NOTE: no ID —> new product
    product.save(() => {
      console.log(`Product (${title}) added!`);
      res.status(201).redirect('/');
    });
  },
  editProduct(req, res) {
    const { id, title, imgURL, description, price } = req.body;
    const product = new Product(id, title, imgURL, description, +price);

    // NOTE: ID —> existing product
    product.save(() => {
      console.log(`Product (${title}) edited!`);
      res.status(302).redirect('/admin/products');
    });
  },
  deleteProduct(req, res) {
    const { id, price } = req.body;

    Product.deleteByID(id, () => {
      Cart.deleteProduct(id, +price, () => {
        console.log(`Product w/ ID ${id} deleted!`);
        res.status(302).redirect('/admin/products');
      });
    });
  }
};
