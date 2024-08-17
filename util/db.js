const mysql = require('mysql2');

// each query —> (1) connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node_complete'
}); // allows multiple simultaneous connections

module.exports = pool.promise();
