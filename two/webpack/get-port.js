const net = require('net');

module.exports = {
  getPort: () => new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.end('Hello world\n');
    });
    server.listen(0, () => {
      resolve(server.address().port)
      server.close()
    })
  }),
  checkPort: (port) => new Promise((resolve, reject) => {
    const server = net.createServer()
      .once('error', (err) => reject(err))
      .once('listening', () => {
        server
          .once('close', resolve)
          .close()
      })
      .listen(port)
  })
}