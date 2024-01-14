const express = require('express');
const fetch = require('node-fetch-retry');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 4000;
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const cors = require('cors');
const client = require('discord.js')
const expressWs = require('express-ws')(app);

app.use(cors({
    origin: '*'
}));

module.exports = app;





const connection = mysql.createConnection({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());
app.use(cookieParser());



let cachedStreams = [];


function populateViewerScatterData() {
  return new Promise((resolve, reject) => {
    let callsigns = [];
    let viewers = [];
    let currentViewerScatterData = [];

    const query = "SELECT * FROM user_pass_title";

    connection.query(query, (err, rows, fields) => {
      if (err) {
        console.error('Error retrieving data:', err);
        reject(err);
      } else {
        rows.forEach(row => {
          callsigns.push(row.callsign);
          viewers.push(row.viewers);
          currentViewerScatterData.push(row.viewer_graph);
        });
        updateViewerGraph();
      }
    });

    function updateViewerGraph() {
      let updatePromises = callsigns.map((callsign, i) => {
        return new Promise((resolve, reject) => {
          const query = "UPDATE user_pass_title SET viewer_graph = ? WHERE callsign = ?";

          let viewerGraph = JSON.parse(currentViewerScatterData[callsigns.indexOf(callsign)]);

          if (viewerGraph.length < 30) {
            viewerGraph.push({
              time: Date.now(),
              viewers: viewers[callsigns.indexOf(callsign)]
            });
          } else {
            viewerGraph.shift();
            viewerGraph.push({
              time: Date.now(),
              viewers: viewers[callsigns.indexOf(callsign)]
            });
          }

          connection.query(query, [JSON.stringify(viewerGraph), callsign], (err, rows, fields) => {
            if (err) {
              console.error('Error retrieving data:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(updatePromises)
        .then(() => resolve())
        .catch(err => reject(err));
    }
  });
}

populateViewerScatterData()

setInterval(() => {
  populateViewerScatterData()
}, 3 * 60 * 1000); // Every 5 minutes
   const fetchTimeout = 15000;
   

   async function checkStreamAvailability(links) {
    const availableStreams = {};

    for (const link of links) {
        try {
            const res = await axios.get(link.url);
            let streamMetadata;
            if (res.status === 200) {
                streamMetadata = {
                    name: link.name,
                    description: link.description,
                    url: link.url,
                    rating: link.rating,
                    viewers: link.viewers,
                    live: 'Yes',
                    title: link.title,
                    thumbnail: {
                      gif: link.thumbnail.gif,
                      png: link.thumbnail.png,
                    },
                    viewer_stats: link.viewer_stats,
                };
            } else {
                streamMetadata = {
                    name: link.name,
                    description: link.description,
                    url: link.url,
                    live: 'No',
                    rating: link.rating,
                    viewers: "0",
                    title: link.title,
                    thumbnail: {
                      gif: link.thumbnail.gif,
                      png: link.thumbnail.png,
                    },
                    viewer_stats: link.viewer_stats,
                };
            }
            availableStreams[link.name] = streamMetadata;

        } catch (error) {
            availableStreams[link.name] = {
                name: link.name,
                description: link.description,
                url: link.url,
                live: 'No',
                rating: link.rating,
                viewers: "0",
                title: link.title,
                thumbnail: {
                  gif: link.thumbnail.gif,
                  png: link.thumbnail.png,
                },
                viewer_stats: link.viewer_stats,
            };
        }
    }

    return availableStreams;
}

async function readLinksFromDatabase() {
  let rows = [];
  try {
    rows = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM user_pass_title', (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
  }

  

  const links = rows.map(row => {
    return {
      name: row.callsign.toUpperCase(),
      url: `https://live.kodicable.net/hls${row.callsign}/${row.callsign}/index.m3u8`,
      title: row.title,
      viewers: row.viewers,
      description: row.description,
      rating: row.rating,
      thumbnail: {
        gif: `https://live.kodicable.net/hls${row.callsign}/out${row.callsign}.gif`,
        png: `https://live.kodicable.net/hls${row.callsign}/out${row.callsign}.png`,
      },
      viewer_stats: JSON.parse(row.viewer_graph),
    };
  });

  return links;
}


async function updateCachedStreams() {
  try {
    const links = await readLinksFromDatabase();
    const availableStreams = await checkStreamAvailability(links);
    cachedStreams = availableStreams;
  } catch (error) {
    console.error('Error updating cached streams:', error);
  }
}

setInterval(updateCachedStreams, 10 * 1000);

updateCachedStreams();

app.get('/api/streams', async (req, res) => {
  res.json({ streams: cachedStreams });
});

const connectionsPerIP = {};

connection.query("UPDATE user_pass_title SET viewers = 0" , (err, results) => {
  if (err) {
    console.error(`Error updating viewer count:`, err);
  } else {
    console.log("reset viewers")
  }
});

const incrementQuery = `UPDATE user_pass_title SET viewers = viewers + 1 WHERE callsign = ?`;
const decrementQuery = `UPDATE user_pass_title SET viewers = viewers - 1 WHERE callsign = ?`;

app.ws("/api/viewer/", (ws, req) => {
  let ip = req.ip
  let streamID;

  ws.on("message", (msg) => {
    streamID = msg
  
    connectionsPerIP[ip] = (connectionsPerIP[ip] || 0) + 1;


    if (connectionsPerIP[ip] <= 4) {
      connection.query(incrementQuery, [streamID], (err, results) => {
        if (err) {
          console.error(`Error updating viewer count:`, err);
        } else {
          //console.log("incremented viewers")
        }
      });
    } else {
      //console.log("too many connections")
    }
  });

  ws.on("close", (msg) => {
    connectionsPerIP[ip]--


    if(connectionsPerIP[ip] < 4) {
      connection.query(decrementQuery, [streamID], (err, results) => {
        if (err) {
          console.error(`Error updating viewer count:`, err);
        } else {
          //console.log("decremented viewers")
        }
      });
    } else {
     // console.log("too many connections")
    }
  });

})


// listen on port 4000
app.listen(port, () => console.log(`Listening on port ${port}`));

