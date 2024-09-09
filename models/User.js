const { Schema, model } = require('mongoose');

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    items: {
      type: [cartItemSchema],
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: cartSchema,
    default: {
      items: [],
      totalPrice: 0
    },
    required: true
  },
  resetToken: String,
  resetTokenExpiry: Date
});

userSchema.methods.calculateTotalPrice = async function () {
  try {
    await this.populate('cart.items.product');
  } catch (err) {
    throw err;
  }
  return this.cart.items.reduce((total, { product, quantity }) => {
    return total + product.price * quantity;
  }, 0);
};

userSchema.methods.addToUserCart = async function ({ _id, price }) {
  try {
    const cartItems = this.cart.items;

    const productIndex = cartItems.findIndex(({ product }) =>
      product.equals(_id)
    );
    if (productIndex >= 0) {
      cartItems[productIndex].quantity++;
    } else {
      cartItems.push({ product: _id, quantity: 1 });
    }
    this.cart.totalPrice = await this.calculateTotalPrice();

    await this.save();
  } catch (err) {
    throw err;
  }
};

userSchema.methods.removeFromUserCart = async function ({ _id, price }) {
  try {
    const cartItems = this.cart.items;

    this.cart.items = cartItems.filter(({ product }) => !product.equals(_id));
    this.cart.totalPrice = await this.calculateTotalPrice();

    await this.save();
  } catch (err) {
    throw err;
  }
};

module.exports = model('User', userSchema);
