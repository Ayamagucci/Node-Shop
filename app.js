// some core modules: http, https, fs, path, os
const http = require('http');

const routes = require('./routes');

// accepts req listener —> returns Server instance
const server = http.createServer(routes);

server.listen(3000); // localhost:3000
