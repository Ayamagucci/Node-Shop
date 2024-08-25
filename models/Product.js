const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imgURL: {
    type: String,
    required: true
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = model('Product', productSchema);
