const Product = require('../models/Product');
const Cart = require('../models/Cart');

module.exports = {
  renderIndex(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products
      });
    });
  },
  renderProducts(_, res) {
    Product.fetchAll((products) => {
      res.status(200).render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products
      });
    });
  },
  renderDetails(req, res) {
    const { id } = req.params;

    Product.findByID(id, (product) => {
      res.status(200).render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      });
    });
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
