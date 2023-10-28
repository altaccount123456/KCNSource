const WebSocket = require('ws');
const mysql = require('mysql2');
require('dotenv').config();
const { WebhookClient, MessageEmbed } = require('discord.js');

const pool = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');

const wss = new WebSocket.Server({ noServer: true });
pool.query(`UPDATE user_pass_title SET viewers = 0` , (err, results) => {
  if (err) {
    console.error(`Error updating viewer count:`, err);
  } else {
    console.log(`Viewer count updated on server startup`);
  }
});

wss.on('connection', (ws, request) => {
  const streamID = parseStreamIdFromURL(request.url);

  const incrementQuery = `UPDATE user_pass_title SET viewers = viewers + 1 WHERE callsign = ?`;
  const decrementQuery = `UPDATE user_pass_title SET viewers = viewers - 1 WHERE callsign = ?`;

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