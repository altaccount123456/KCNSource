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




const connection = mysql.createConnection({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());
app.use(cookieParser());



titleData = {};
const streamTitles = {};
let streamName = {};
let cachedStreams = [];


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

  setTimeout(updateCachedStreams, 5 * 1000); // Refresh every 5 seconds
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