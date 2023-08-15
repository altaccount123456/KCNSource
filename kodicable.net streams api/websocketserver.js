const WebSocket = require('ws');
const mysql = require('mysql2');
const { WebhookClient, MessageEmbed } = require('discord.js');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'wpeyrliy_root',
  password: 'nDppsjbeXtHg',
  database: 'wpeyrliy_auth',
});

const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, request) => {
  const streamID = parseStreamIdFromURL(request.url);

  const incrementQuery = `UPDATE user_pass_title SET viewers = viewers + 1 WHERE callsign = ?`;
  const decrementQuery = `UPDATE user_pass_title SET viewers = viewers - 1 WHERE callsign = ?`;

  // Increment viewer count when a client connects
  pool.query(incrementQuery, [streamID], (err, results) => {
    if (err) {
      console.error(`Error updating viewer count for stream ${streamID}:`, err);
    } else {
      console.log(`Viewer count updated for stream ${streamID}`);
    }
  });

  console.log(`WebSocket connection open for stream: ${streamID}`);

  ws.on('message', (message) => {
    console.log(`Received message for stream ${streamID}: ${message}`);
    ws.send(`You sent me a message: ${message}!`);
  });

  ws.on('close', () => {
    // Decrement viewer count when a client disconnects
    pool.query(decrementQuery, [streamID], (err, results) => {
      if (err) {
        console.error(`Error updating viewer count for stream ${streamID}:`, err);
      } else {
        console.log(`Viewer count updated for stream ${streamID}: ${results.affectedRows}`);
      }
    });

    console.log(`WebSocket connection closed for stream: ${streamID}`);
  });
});

function parseStreamIdFromURL(url){
  const parts = url.split('/')
  return parts[parts.length - 1]
}

module.exports = wss; 
