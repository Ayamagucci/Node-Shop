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
const isAuth = require('../util/isAuth');

router.get('/products', isAuth, renderAdminProducts);
router.get('/add-product', isAuth, renderAdder);
router.get('/edit-product/:id', isAuth, renderEditor);

router.post('/add-product', isAuth, addProduct);
router.post('/edit-product', isAuth, editProduct);
router.post('/delete-product', isAuth, deleteProduct);

module.exports = router;
