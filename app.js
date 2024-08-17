require('dotenv').config();
const { PORT } = process.env;
const path = require('path');
const express = require('express');

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const { renderError } = require('./controllers/error');

const sequelize = require('./models/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ASSOCIATIONS
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' }); // NOTE: user deleted —> assoc. products deleted
User.hasMany(Product);

Cart.belongsTo(User);
User.hasOne(Cart);

// many-many relationships —> intermediary model **
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

// SERVER SETUP
(async () => {
  try {
    // SYNC DB MODELS
    await sequelize.sync();
    // await sequelize.sync({ force: true });

    console.log('All models synced successfully!');
  } catch (err) {
    console.error('Error syncing models:', err);
    process.exit(1); // exit process if models fail to sync
  }

  try {
    // CREATE OR FIND DUMMY USER & CART
    const [user] = await User.findOrCreate({
      where: { id: 1 },
      defaults: { name: 'Alex', email: 'test@test.com' }
    });
    await Cart.findOrCreate({
      where: { userId: user.id }
    });

    // ASSIGN DUMMY USER (SEQUELIZE OBJ) TO ALL REQS
    app.use(async (req, _, next) => {
      try {
        req.user = user;
        next();
      } catch (err) {
        console.error('Error assigning dummy user to req:', err);
        next(err); // pass error to error handler if middleware fails
      }
    });

    app.use('/admin', adminRoutes);
    app.use(shopRoutes);
    app.use(renderError);

    app.listen(PORT, () => {
      console.log(`Server listening at PORT: ${PORT}`);
    });
  } catch (err) {
    console.error('Error setting up server:', err);
    process.exit(1); // exit process if error during setup
  }
})();
