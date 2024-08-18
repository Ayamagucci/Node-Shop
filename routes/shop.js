const express = require('express');
const router = express.Router();
const {
  renderIndex,
  renderProducts,
  renderDetails,
  renderCart,
  addToCart,
  removeFromCart,
  renderOrders,
  postOrder,
  renderCheckout
} = require('../controllers/shop');

router.get('/', renderIndex);
router.get('/products', renderProducts);
router.get('/products/:id', renderDetails);
router.get('/cart', renderCart);
router.get('/orders', renderOrders);
router.get('/checkout', renderCheckout);

router.post('/cart', addToCart);
router.post('/cart/remove', removeFromCart);
router.post('/orders', postOrder);

module.exports = router;
