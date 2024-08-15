const express = require('express');
const router = express.Router();
const {
  renderIndex,
  renderProducts,
  renderDetails,
  renderOrders,
  renderCheckout,
  renderCart,
  addToCart,
  removeFromCart
} = require('../controllers/shop');

router.get('/', renderIndex);
router.get('/products', renderProducts);
router.get('/products/:id', renderDetails);
router.get('/orders', renderOrders);
router.get('/checkout', renderCheckout);
router.get('/cart', renderCart);

router.post('/cart', addToCart);
router.post('/cart/remove', removeFromCart);

module.exports = router;
