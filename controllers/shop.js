const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');

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
      // NOTE: Sequelize performs type coercion BTS, but still good practice to convert!
      const product = await Product.findByPk(+id);
      // const [product] = await Product.findAll({ where: { id: +id } });

      res.status(200).render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      });
    } catch (err) {
      console.error(`Error rendering Product (${title}) Details:`, err);
      res.status(500).render('error', { pageTitle: 'Details Error', path: '' });
    }
  },
  async renderOrders(req, res) {
    try {
      const orders = await req.user.getOrders({ include: ['products'] });
      console.log('Orders:', orders);

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
      const cart = await req.user.getCart();
      const products = await cart.getProducts();

      const order = await req.user.createOrder();
      const orderItems = products.map((product) => ({
        orderId: order.id,
        productId: product.id,
        quantity: product.cartItem.quantity
      }));

      // bulkCreate —> multiple items added at once
      await OrderItem.bulkCreate(orderItems);

      await cart.setProducts(null); // clears cart

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
  },
  async renderCart(req, res) {
    try {
      const cart = await req.user.getCart();
      const products = await cart.getProducts();

      res.status(200).render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products
      });
    } catch (err) {
      console.error('Error rendering Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  },
  async addToCart(req, res) {
    const { id } = req.body;
    try {
      const cart = await req.user.getCart();
      let [product] = await cart.getProducts({ where: { id: +id } });

      if (product) {
        const newQuantity = product.cartItem.quantity + 1; // every product in cart —> related cartItem that includes its quantity **
        await product.cartItem.update({ quantity: newQuantity });
      } else {
        product = await Product.findByPk(+id);
        await cart.addProduct(product, { through: { quantity: 1 } }); // through CartItem w/ quantity of 1 **
      }
      res.status(201).redirect('/cart');
    } catch (err) {
      console.error('Error adding to Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  },
  async removeFromCart(req, res) {
    const { id } = req.body;
    try {
      const cart = await req.user.getCart();
      const [product] = await cart.getProducts({ where: { id: +id } });

      await product.cartItem.destroy();
      res.status(204).redirect('/cart');
    } catch (err) {
      console.error('Error removing item from Cart:', err);
      res.status(500).render('error', { pageTitle: 'Cart Error', path: '' });
    }
  }
};
