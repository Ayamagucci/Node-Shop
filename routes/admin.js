const express = require('express');
const router = express.Router();
const {
  renderAdminProducts,
  renderAdder,
  renderEditor,
  addProduct,
  editProduct,
  deleteProduct
} = require('../controllers/admin');

router.get('/products', renderAdminProducts);
router.get('/add-product', renderAdder);
router.get('/edit-product/:id', renderEditor);

router.post('/add-product', addProduct);

// NOTE: HTML forms only natively support GET & POST methods **
router.post('/edit-product', editProduct);
router.post('/delete-product', deleteProduct);

module.exports = router;
