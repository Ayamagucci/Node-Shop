const express = require('express');
const router = express.Router();
const { renderShop } = require('../controllers/products');

router.get('/', renderShop);

module.exports = router;
