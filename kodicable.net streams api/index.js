const app = require('./server'); 
const https = require('node:https');
const mysql = require('mysql2')
const fs = require('node:fs/promises');
const { Server } = require("socket.io");

const connectionsPerIP = {};

const pool = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// reset all viewers
pool.query(`UPDATE user_pass_title SET viewers = 0` , (err, results) => {
  if (err) {
    console.error(`Error updating viewer count:`, err);
  } else {
    console.log(`Reset viewer count`);
  }
});


async function startServer() {
  const key = await fs.readFile('cert/kcn_key.pem');
  const cert = await fs.readFile('cert/kcn_cert.pem');

  const httpsServer = https.createServer({
    key, 
    cert,
  }, app);

  const port = 5000;

  httpsServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  const io = new Server(httpsServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  })

  io.on("connection", (socket) => {
    const incrementQuery = `UPDATE user_pass_title SET viewers = viewers + 1 WHERE callsign = ?`;
    const decrementQuery = `UPDATE user_pass_title SET viewers = viewers - 1 WHERE callsign = ?`;
    let clientIP;
    let callsign;

    socket.on("viewerJoin", (data) => {
      clientIP = socket.handshake.address;
      callsign = data.callsign;
      connectionsPerIP[clientIP] = (connectionsPerIP[clientIP] || 0) + 1;
      

      if (connectionsPerIP[clientIP] <= 4) {
        pool.query(incrementQuery, [callsign], (err, results) => {
          if (err) {
            console.error(`Error updating viewer count:`, err);
          } else {
            // console.log(`Updated viewer count for ${callsign}`);
          }
        });
      } else {
       // console.log(`Connection from ${clientIP} rejected for stream ${callsign} due to viewer limit`);
      }

    });

    socket.on("disconnect", () => {
      //console.log("Client disconnected");
      connectionsPerIP[clientIP]--

      if (connectionsPerIP[clientIP] < 4) {
        pool.query(decrementQuery, [callsign], (err, results) => {
          if (err) {
            console.error(`Error updating viewer count for stream ${callsign}:`, err);
          } else {
           // console.log(`Updated viewer count for ${callsign}`);
          }
        });
      }
  
    });
  })

}

startServer().catch(error => console.error(error));