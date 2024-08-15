const path = require('path');

const generateFile = (name) =>
  path.join(path.dirname(require.main.filename), 'data', `${name}.json`);

module.exports = {
  productsPath: generateFile('products'),
  cartPath: generateFile('cart')
};
