const fs = require('fs');

/* BTS:
  • event cbs —> EVENT LOOP (single-threaded)
    1. timers (setTimeout, setInterval)
    2. pending cbs (deferred I/O-related cbs)
    3. poll (new I/O events —> cbs)
    4. check (setImmediate cbs)
    5. 'close' cbs
    6. process.exit (refs === 0)

  • fs + other slow operations —> WORKER POOL (multi-threaded)
*/

const reqHandler = (req, res) => {
  // console.log(req.url, req.method, req.headers);

  // NOTE: vars out here —> overwritten by diff reqs **
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Message</title></head>');
    res.write('<body>');
    res.write(
      '<form action="/message" method="POST"><input name="message" type="text" /><button type="submit">Send</button></form>'
      /* NOTES:
        • form "action" –> req URL
        • input "name" –> name to which data assigned
      */
    );
    res.write('</body>');
    res.write('</html>');

    return res.end();
  }

  if (url === '/message' && method === 'POST') {
    const body = [];

    // 'data' event —> fires w/ new chunks **
    req.on('data', (chunk) => {
      // console.log(chunk); // message=TEST
      body.push(chunk);
    });

    // 'end' event —> fires when done parsing req **
    return req.on('end', () => {
      // BUFFERS
      const parsedBody = Buffer.concat(body).toString(); // creates buffer comprised of chunks (NOTE: buffers themselves!) —> converts to str
      // console.log(parsedBody); // <Buffer 6d 65 73 73 61 67 65 3d 54 45 53 54>

      // extract user msg —> write file
      const msg = parsedBody.split('=')[1];

      // fs.writeFileSync('message.txt', msg); // blocking
      fs.writeFile('message.txt', msg, () => {
        // redirect after file written **
        res.statusCode = 302;
        res.setHeader('Location', '/');

        return res.end();
      });
    });
    /* NOTE: handlers not exec immediately! **
      • just added internally for future
      • moves onto next line if no return statement **
    */
  }

  // DEFAULT (if url !== '/')
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My First Page</title></head>');
  res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
  res.write('</html>');

  res.end();
  // process.exit(); // exits event loop **
};

module.exports = reqHandler;
