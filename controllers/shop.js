const Product = require('../models/Product');
const Cart = require('../models/Cart');

module.exports = {
  // only modified 'renderIndex', 'renderProducts', 'renderDetails'
  async renderIndex(_, res) {
    try {
      res.status(200).render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products: await Product.fetchAll()
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Index Error', path: '' });
    }
  },
  async renderProducts(_, res) {
    try {
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products: await Product.fetchAll()
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render('error', { pageTitle: 'Products Error', path: '' });
    }
  },
  async renderDetails(req, res) {
    const { id } = req.params;
    const product = await Product.findByID(id);
    try {
      res.status(200).render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { pageTitle: 'Details Error', path: '' });
    }
  },
  renderOrders(_, res) {
    res.status(200).render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders'
    });
  },
  renderCheckout(_, res) {
    res.status(200).render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  },
  renderCart(_, res) {
    // fetch current cart
    Cart.fetchAll((cart) => {
      // fetch all products
      Product.fetchAll((products) => {
        const cartProducts = []; // stores products w/ details

        // iterate thru products & cart
        for (const product of products) {
          // matching ID —> add to 'cartProducts'
          const cartProduct = cart.products.find(
            (prod) => prod.id === product.id
          );
          if (cartProduct) {
            cartProducts.push({ ...product, quantity: cartProduct.quantity });
          }
        }
        // send res
        res.status(200).render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: cartProducts
        });
      });
    });
  },
  addToCart(req, res) {
    const { id } = req.body;

    Product.findByID(id, (product) => {
      Cart.addProduct(id, product.price, () => {
        console.log(`Product (${product.title}) added to cart!`);
        res.status(201).redirect('/cart');
      });
    });
  },
  removeFromCart(req, res) {
    const { id } = req.body;

    Product.findByID(id, ({ price, title }) => {
      Cart.deleteProduct(id, price, () => {
        console.log(`Product (${title}) removed from cart!`);
        res.status(204).redirect('/cart');
      });
    });
  }
};
