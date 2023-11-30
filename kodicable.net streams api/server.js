const express = require('express');
const fetch = require('node-fetch');
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

let callsigns = [];
let viewers = [];
let currentViewerScatterData = [];

function populateViewerScatterData() {
  const query = "SELECT * FROM user_pass_title";

    connection.query(query, (err, rows, fields) => {
    if (err) {
      console.error('Error retrieving data:', err);
    } else {
      rows.forEach(row => {
        callsigns.push(row.callsign);
        viewers.push(row.viewers);
        currentViewerScatterData.push(row.viewer_graph);

        updateViewerGraph();
      });
      function updateViewerGraph() {
        callsigns.forEach((callsign, i) => {
          const query = "UPDATE user_pass_title SET viewer_graph = ? WHERE callsign = ?";
      
          // do the viewer graph stuff here
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
            } else {
             // console.log("Success!");
            }
          });
        });
      }
    }
  });



}

setInterval(() => {
  // populateViewerScatterData()
}, 5000)
populateViewerScatterData()


async function checkStreamAvailability(links) {
  const availableStreams = {};

  const callsigns = await readLinksFromDatabase();

  for (const link of links) {
    try {
      const response = await fetch(link.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      if (response.status === 200) {
        const streamMetadata = {
          name: link.name,
          description: link.description,
          url: link.url,
          rating: link.rating,
          viewers: link.viewers,
          live: 'Yes',
          title: link.title,
          thumbnail: link.thumbnail,
          viewer_stats: link.viewer_stats,
      };
        availableStreams[link.name] = streamMetadata;
      } else {
        const streamMetadata = {
          name: link.name,
          description: link.description,
          url: link.url,
          live: 'No',
          rating: link.rating,
          viewers: "0",
          title: link.title,
          thumbnail: link.thumbnail,
          viewer_stats: link.viewer_stats,
      };
        availableStreams[link.name] = streamMetadata;
      }
    } catch (error) {
      const streamMetadata = {
        name: link.name,
        description: link.description,
        url: link.url,
        live: 'No',
        rating: link.rating,
        viewers: "0",
        title: link.title,
        thumbnail: link.thumbnail,
        viewer_stats: link.viewer_stats,
    };
      availableStreams[link.name] = streamMetadata;
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
      thumbnail: `https://live.kodicable.net/hls${row.callsign}/out${row.callsign}.png`,
      viewer_stats: JSON.parse(row.viewer_graph),
    };
  });

  return links;
}

function updateViewerStats() {
  console.log('Updating viewer stats...');
  populateViewerScatterData();
}
setInterval(updateViewerStats, 5 * 60000); // Refresh every 5 mins
updateViewerStats();

async function updateCachedStreams() {
  try {
    const links = await readLinksFromDatabase();
    const availableStreams = await checkStreamAvailability(links);
    cachedStreams = availableStreams;
  } catch (error) {
    console.error('Error updating cached streams:', error);
  }
  setInterval(updateCachedStreams, 5 * 1000); // Refresh every 5 seconds
}

updateCachedStreams();

app.get('/api/streams', async (req, res) => {
  res.json({ streams: cachedStreams });
});

// ws server for viewer count 






app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("API Server")
});