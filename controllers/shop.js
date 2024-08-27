const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports = {
  async renderProducts(req, res, next) {
    try {
      const products = await Product.find({});
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/',
        products
      });
    } catch (err) {
      console.error('Error rendering Products:', err);
      return next(err);
    }
  },
  async renderDetails(req, res, next) {
    const { id } = req.params;
    try {
      const product = await Product.findById(id);
      res.status(200).render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      });
    } catch (err) {
      console.error('Error rendering Product Details:', err);
      return next(err);
    }
  },
  async renderCart(req, res, next) {
    try {
      const user = await req.user.populate('cart.items.product');
      const products = user.cart.items.map(({ product, quantity }) => {
        const { _id, title, price, imgURL, description } = product;
        return {
          _id,
          title,
          price,
          imgURL,
          description,
          quantity
        };
      });
      res.status(200).render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        totalPrice: req.user.cart.totalPrice,
        products
      });
    } catch (err) {
      console.error('Failed to fetch product data for Cart:', err);
      return next(err);
    }
  },
  async addToCart(req, res, next) {
    const { id } = req.body;
    try {
      const product = await Product.findById(id);
      await req.user.addToUserCart(product);

      res.status(201).redirect('/cart');
    } catch (err) {
      console.error('Error adding to Cart:', err);
      return next(err);
    }
  },
  async removeFromCart(req, res, next) {
    const { id } = req.body;
    try {
      const product = await Product.findById(id);
      await req.user.removeFromUserCart(product);

      res.status(200).redirect('/cart');
    } catch (err) {
      console.error('Error removing item from Cart:', err);
      return next(err);
    }
  },
  async renderOrders(req, res, next) {
    try {
      const orders = await Order.find({ buyer: req.user.id }).populate(
        'items.product'
      );
      res.status(200).render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      });
    } catch (err) {
      console.error('Error rendering Orders:', err);
      return next(err);
    }
  },
  async postOrder(req, res, next) {
    const { id, cart } = req.user;
    const order = new Order({
      buyer: id,
      items: cart.items,
      totalPrice: cart.totalPrice
    });
    try {
      await order.save();

      req.user.cart = {
        items: [],
        totalPrice: 0
      };
      await req.user.save();

      res.status(201).redirect('/orders');
    } catch (err) {
      console.error('Error posting Order:', err);
      return next(err);
    }
  },
  renderCheckout(req, res) {
    res.status(200).render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }
};
