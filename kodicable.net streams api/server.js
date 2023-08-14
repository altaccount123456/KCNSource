const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 4000;
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const cors = require('cors');
const client = require('discord.js')
const { MessageEmbed, WebhookClient } = require('discord.js');

app.use(cors({
    origin: '*'
}));


const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');


const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'wpeyrliy_root',
  password: 'nDppsjbeXtHg',
  database: 'wpeyrliy_auth',
});

app.use(bodyParser.json());
app.use(cookieParser());



titleData = {};
const streamTitles = {};
let streamName = {};
let cachedStreams = [];

app.post("/receiveauthstuff", (req, res) => {
  let { username, newTitle } = req.body;

  titleData = req.body.newTitle
  streamName = req.body.username

  // Update title data for the username

  try {
    const query = `UPDATE user_pass_title SET title='${newTitle}' WHERE callsign='${username}'`;
    connection.query(query, (error, results, fields) => {
      if (error) {
        console.error(`Error updating title for ${username}:`, error);
        res.sendStatus(500);
      } else {
        const embed = new MessageEmbed()
        .setTitle(`Title Changed for ${username}! `)
        .setDescription(`New Title: ${newTitle}`)
        .setColor('#0099ff')
        .setTimestamp();
        console.log(`Title updated for ${username}: ${newTitle}`);
        webhookClient.send(embed)
          .then(() => {
            console.log('Message sent successfully');
            res.sendStatus(200);
          })
          .catch((error) => {
            console.error('Error sending message:', error);
            res.sendStatus(500);
          });
      }
    });
  } catch (error) {
    console.error(`Error updating title for ${username}:`, error);
    res.sendStatus(500);
  }
});


async function checkStreamAvailability(links) {
  const availableStreams = [];

  const callsigns = await readLinksFromDatabase();

  for (const link of links) {
    try {
      const response = await fetch(link.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      if (response.status === 200) {
        availableStreams.push({
          name: link.name,
          url: link.url,
          rating: link.rating,
          live: 'Yes',
          title: link.title,
          thumbnail: link.thumbnail,
        });
      } else {
        availableStreams.push({
          name: link.name,
          url: link.url,
          live: 'No',
          rating: link.rating,
          title: link.title,
          thumbnail: link.thumbnail,
        });
      }
    } catch (error) {
      console.error(`Error checking stream at ${link.url}:`, error.message);
      availableStreams.push({
        name: link.name,
        url: link.url,
        live: 'No',
        rating: link.rating,
        title: link.title,
        thumbnail: link.thumbnail,
      });
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

  setTimeout(updateCachedStreams, 5 * 1000); // Refresh every 30 seconds
}

updateCachedStreams();

app.get('/api/streams', async (req, res) => {
  res.json({ streams: cachedStreams });
});






app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("API Server")
});