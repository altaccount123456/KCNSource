const WebSocket = require('ws');
const { WebhookClient, MessageEmbed } = require('discord.js');

const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log(`Received WebSocket message: ${message}`);

    ws.send(`You sent: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

module.exports = wss; 
