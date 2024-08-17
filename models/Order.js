const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
});

module.exports = Order;
