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
    type: Schema.Types.ObjectId, // NOTE: instantiation —> Mongoose.Types.ObjectId
    ref: 'User',
    required: true
  }
});

/* NOTES:
  • MongoDB itself == schema-less
  • validation does not occur until saving
   (i.e. instance in memory not validated)
*/
module.exports = model('Product', productSchema);
