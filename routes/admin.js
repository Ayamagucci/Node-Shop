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
const { body } = require('express-validator');

router.get('/products', isAuth, renderAdminProducts);

router.get('/add-product', isAuth, renderAdder);
router.post(
  '/add-product',
  [
    body('title', 'Title must contain at least (4) characters!')
      .trim()
      .isLength({ min: 4 }),
    body('price', 'Please enter a valid price!').isFloat(),
    body('description', 'Description must contain 4-400 characters!')
      .trim()
      .isLength({ min: 4, max: 400 }),
    body('imgURL', 'Please enter a valid image URL!').trim().isURL()
  ],
  isAuth,
  addProduct
);

router.get('/edit-product/:productId', isAuth, renderEditor);
router.post(
  '/edit-product',
  [
    body('title', 'Title must contain at least (4) characters!')
      .trim()
      .isLength({ min: 4 }),
    body('price', 'Please enter a valid price!').isFloat(),
    body('description', 'Description must contain 4-400 characters!')
      .trim()
      .isLength({ min: 4, max: 400 }),
    body('imgURL', 'Please enter a valid image URL!').trim().isURL()
  ],
  isAuth,
  editProduct
);

router.post('/delete-product', isAuth, deleteProduct);

module.exports = router;
