const express = require('express');
const router = express.Router();
const { products } = require('./admin');

router.get('/', (_, res) => {
  // console.log('shop.js:', products); // NOTE: data consistent across diff reqs & users (unless server restarted) **

  // PUG + EJS
  res.status(200).render('shop', { pageTitle: 'Shop', path: '/', products });

  /* HANDLEBARS
  res.status(200).render('shop', {
    // layout: false, // <— if not using main layout
    pageTitle: 'Shop',
    path: '/',
    productCSS: true,
    activeShop: true,
    hasProducts: products.length > 0,
    products
  });
  */
});

module.exports = router;
