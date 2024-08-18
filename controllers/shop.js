const Product = require('../models/Product');

module.exports = {
  async renderIndex(_, res) {
    try {
      const products = await Product.findAll();
      res.status(200).render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products
      });
    } catch (err) {
      console.error('Error rendering Index:', err);
      res.status(500).render('error', { pageTitle: 'Index Error', path: '' });
    }
  },
  async renderProducts(_, res) {
    try {
      const products = await Product.findAll();
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products
      });
    } catch (err) {
      console.error('Error rendering Products:', err);
      res
        .status(500)
        .render('error', { pageTitle: 'Products Error', path: '' });
    }
  },
  async renderDetails(req, res) {
    const { id } = req.params;
    try {
      const product = await Product.findById(id);
      res.status(200).render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      });
    } catch (err) {
      console.error(`Error rendering Product Details:`, err);
      res.status(500).render('error', { pageTitle: 'Details Error', path: '' });
    }
  },
  async renderCart(req, res) {
    try {
      const products = await req.user.getCartItemData();
      res.status(200).render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        totalPrice: req.user.cart.totalPrice,
        products
      });
    } catch (err) {
      console.error('Failed to fetch product data for Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  },
  async addToCart(req, res) {
    const { id } = req.body;
    try {
      const product = await Product.findById(id);
      await req.user.addToUserCart(product);
      res.status(201).redirect('/cart');
    } catch (err) {
      console.error('Error adding to Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  },
  async removeFromCart(req, res) {
    const { id } = req.body;
    try {
      const product = await Product.findById(id);
      await req.user.removeFromUserCart(product);
      res.status(204).redirect('/cart');
    } catch (err) {
      console.error('Error removing item from Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  },
  async renderOrders(req, res) {
    try {
      const orders = await req.user.getOrders();
      res.status(200).render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      });
    } catch (err) {
      console.error('Error rendering Orders:', err);
      res.status(500).render('error', { pageTitle: 'Orders Error', path: '' });
    }
  },
  async postOrder(req, res) {
    try {
      await req.user.addOrder();
      res.status(201).redirect('/orders');
    } catch (err) {
      console.error('Error posting Order:', err);
      res
        .status(500)
        .render('error', { pageTitle: 'Order Posting Error', path: '' });
    }
  },
  renderCheckout(_, res) {
    res.status(200).render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }
};
