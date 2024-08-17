const Product = require('../models/Product');
const Cart = require('../models/Cart');

// only 'renderAdminProducts', 'renderEditor', 'addProduct' incorporate dummy user
module.exports = {
  async renderAdminProducts(_, res) {
    try {
      // const products = await Product.findAll();
      const products = await req.user.getProducts();

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
      // const product = await Product.findByPk(+id);
      const [product] = await req.user.getProducts({ where: { id: +id } });

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
    try {
      const { title, imgURL, description, price } = req.body;

      /*
      await Product.create({
        title,
        imgURL,
        description,
        price: +price,
        userId: req.user.id
      });
      */

      // ASSOC-SPECIFIC METHODS
      await req.user.createProduct({
        title,
        imgURL,
        description,
        price: +price
      });
      res.status(201).redirect('/');
    } catch (err) {
      console.error(`Error adding product (${title}):`, err);
      res.status(500).render('error', { pageTitle: 'Adding Error', path: '' });
    }
  },
  async editProduct(req, res) {
    const { id, title, imgURL, description, price } = req.body;
    try {
      const product = await Product.findByPk(+id);
      await product.update({ title, imgURL, description, price: +price });
      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error(`Error editing product (${title}):`, err);
      res.status(500).render('error', { pageTitle: 'Editing Error', path: '' });
    }
  },
  async deleteProduct(req, res) {
    const { id, price } = req.body;
    try {
      const product = await Product.findByPk(+id);
      await product.destroy();

      // TODO: implement Cart.deleteProduct **

      res.status(302).redirect('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      res
        .status(500)
        .render('error', { pageTitle: 'Deletion Error', path: '' });
    }
  }
};
