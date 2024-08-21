const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports = {
  async renderIndex(_, res) {
    try {
      const products = await Product.find({});
      res.status(200).render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products
      });
    } catch (err) {
      console.error('Error rendering Index:', err);
      return next(err);
    }
  },
  async renderProducts(_, res) {
    try {
      const products = await Product.find({});
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products
      });
    } catch (err) {
      console.error('Error rendering Products:', err);
      return next(err);
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
      console.error('Error rendering Product Details:', err);
      return next(err);
    }
  },
  async renderCart(req, res) {
    try {
      const user = await req.user.populate({
        // replaces 'ref' field w/ actual data from referenced doc **
        path: 'cart.items.product',
        select: 'title price description imgURL'
      });

      // console.log('user:', user);
      // console.log('user.cart.items[0]:', user.cart.items[0]);

      const products = user.cart.items.map(({ product, quantity }) => {
        const { _id, title, price, imgURL, description } = product; // NOTE: actual data —> extracting '_id' (not 'id')!
        return {
          _id,
          title,
          price,
          imgURL,
          description,
          quantity
        };
      });
      // console.log('products:', products);

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
  async addToCart(req, res) {
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
  async removeFromCart(req, res) {
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
  async renderOrders(req, res) {
    try {
      const orders = await Order.find({ buyer: req.user.id }).populate(
        'items.product' // each item in view —> product details
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
  async postOrder(req, res) {
    const { cart } = req.user;

    const order = new Order({
      buyer: req.user.id,
      items: cart.items,
      totalPrice: cart.totalPrice
    });
    try {
      await order.save(); // save new order

      // reset cart
      req.user.cart = {
        items: [],
        totalPrice: 0
      };
      await req.user.save(); // save user (cart)

      res.status(201).redirect('/orders');
    } catch (err) {
      console.error('Error posting Order:', err);
      return next(err);
    }
  },
  renderCheckout(_, res) {
    res.status(200).render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }
};
