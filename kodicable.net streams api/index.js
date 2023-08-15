const http = require('http');
const app = require('./server'); 
const websocketServer = require('./websocketserver');
const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  websocketServer.handleUpgrade(request, socket, head, (ws) => {
    websocketServer.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});