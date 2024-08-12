const express = require('express');
const router = express.Router();

const products = [];

router.get('/add-product', (_, res) => {
  // PUG + EJS
  res.status(200).render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product'
  });

  /* HANDLEBARS
  res.status(200).render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
  */
});

router.post('/add-product', (req, res) => {
  products.push({ title: req.body.title });
  res.status(201).redirect('/');
});

module.exports = {
  adminRoutes: router,
  products
};
