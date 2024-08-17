const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imgURL: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(1234),
    allowNull: false
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
});

/* NOTE: 'createdAt' & 'updatedAt' timestamps by default
  • disabled by passing { timestamps: false } as third (options) arg
*/

module.exports = Product;
