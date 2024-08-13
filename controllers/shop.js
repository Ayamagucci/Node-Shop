const Product = require('../models/Product');

module.exports = {
  getIndex(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products
      });
    });
  },
  getProducts(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products
      });
    });
  },
  getCart(_, res) {
    res.status(200).render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart'
    });
  },
  getOrders(_, res) {
    res.status(200).render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders'
    });
  },
  getCheckout(_, res) {
    res.status(200).render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }
};
