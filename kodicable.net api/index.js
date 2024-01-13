const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2')
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  

const app = express();
const port = 4500;

// Authenticate StreamKey

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    // redirect to https://kodicable.net
    res.redirect('https://kodicable.net');
});

app.post("/auth", async (req, res) => {
  const callsign = req.body.name;
  const streamkey = req.body.key;

  if (!streamkey) {
    return res.status(400).send('Invalid request. Missing stream key.');
  }

  try {
    const [rows] = await pool.query('SELECT * FROM user_pass_title WHERE callsign = ? AND streamkey = ?', [callsign, streamkey]);
    if (rows.length > 0) {
      res.status(200).send();
      console.log(rows);
    } else {
      res.status(400).send(`Invalid streamkey: ${streamkey}`);
      console.log('Authentication failed: ', rows);
    }
  } catch (err) {
    console.error('Error while querying the database: ', err);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// start the Express server

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});