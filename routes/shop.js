const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../util/path');

// NOTE: HTTP methods (vs. 'use') —> exact URL **
router.get('/', (_, res) => {
  res.status(200).sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
