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
const { body } = require('express-validator');
const isAuth = require('../util/isAuth');

router.get('/products', isAuth, renderAdminProducts);

router.get('/add-product', isAuth, renderAdder);
router.post(
  '/add-product',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Title must contain at least (4) characters!'),
    body('price').isFloat().withMessage('Please enter a valid price!'),
    body('description')
      .trim()
      .isLength({ min: 4, max: 400 })
      .withMessage('Description must contain 4-400 characters!'),
    body('imgURL').trim().isURL().withMessage('Please enter a valid image URL!')
  ],
  addProduct
);

router.get('/edit-product/:productId', isAuth, renderEditor);
router.post(
  '/edit-product',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Title must contain at least (4) characters!'),
    body('price').isFloat().withMessage('Please enter a valid price!'),
    body('description')
      .trim()
      .isLength({ min: 4, max: 400 })
      .withMessage('Description must contain 4-400 characters!'),
    body('imgURL').trim().isURL().withMessage('Please enter a valid image URL!')
  ],
  editProduct
);

router.post('/delete-product', isAuth, deleteProduct);

module.exports = router;
