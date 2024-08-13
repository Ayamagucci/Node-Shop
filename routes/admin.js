const express = require('express');
const router = express.Router();
const { renderAddProduct, addProduct, getProducts } = require('../controllers/admin');

router.get('/add-product', renderAddProduct);
router.get('/products', getProducts);
router.post('/add-product', addProduct);

module.exports = router;
