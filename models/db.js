require('dotenv').config();
const { DB_HOST, DB_USER, DB_PW, DB_NAME } = process.env;
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PW, {
  // host: 'localhost', // default
  dialect: 'mysql'
});

module.exports = sequelize;
