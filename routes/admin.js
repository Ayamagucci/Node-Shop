const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../util/path');

router.get('/add-product', (_, res) => {
  res
    .status(200)
    /*
    .send(
      '<form action="/admin/add-product" method="POST"><input type="text" name="title" /><button type="submit">Add Product</button></form>'
      // NOTE: form action —> "/admin/" prefix!
    )
    */
    .sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product', (req, res) => {
  console.log(req.body); // [Object: null prototype] { title: '...' }
  res.status(201).redirect('/');
});

module.exports = router;
