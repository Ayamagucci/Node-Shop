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
    required: true,
    index: true
  }
});

productSchema.index({ _id: 1, vendor: 1 });

module.exports = model('Product', productSchema);
