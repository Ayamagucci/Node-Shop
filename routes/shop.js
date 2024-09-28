const express = require('express');
const router = express.Router();
const {
  renderProducts,
  renderDetails,
  renderCart,
  addToCart,
  removeFromCart,
  renderOrders,
  postOrder,
  renderCheckout
} = require('../controllers/shop');
const isAuth = require('../util/isAuth');

router.get('/', renderProducts);
router.get('/products/:productId', renderDetails);

router.get('/cart', isAuth, renderCart);
router.get('/orders', isAuth, renderOrders);
router.get('/checkout', isAuth, renderCheckout);

router.post('/cart', isAuth, addToCart);
router.post('/cart/remove', isAuth, removeFromCart);
router.post('/orders', isAuth, postOrder);

module.exports = router;
