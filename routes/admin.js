const express = require('express');
const router = express.Router();
const { renderAddProduct, addProduct } = require('../controllers/products');

router.get('/add-product', renderAddProduct);
router.post('/add-product', addProduct);

module.exports = router;
