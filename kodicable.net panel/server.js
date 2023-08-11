const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;
const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
  host: '127.0.0.1',
  user: 'wpeyrliy_root',
  password: 'nDppsjbeXtHg',
  database: 'wpeyrliy_auth',
});

// Generate a unique secret key for each user
const secretKeys = {};
const generateSecretKey = (req, res, next) => {
  const { username } = req.user;
  if (!secretKeys[username]) {
    secretKeys[username] = uuidv4();
    
  }

  next();
};


const setTokenCookie = (req, res, next) => {
  const { username } = req.user;
  const token = jwt.sign({ username }, secretKeys[username], { expiresIn: '12h' });
  res.cookie('token', token, { httpOnly: true, secure: true });
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const { username } = jwt.verify(token, secretKeys[req.params.username]);
    req.user = { username };
    next();
  } catch (err) {
    res.status(400).send('Invalid token.');
  }
};

const verifyToken2 = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const { username } = jwt.verify(token, secretKeys[req.body.username]);
    req.user = { username };
    next();
  } catch (err) {
   res.status(400).send(`Invalid token. ${err}`);
  }
};


const verifyToken3 = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const { username } = jwt.verify(token, secretKeys[req.body.username]);
    req.user = { username };
    next();
  } catch (err) {
   res.status(400).send(`Invalid token. ${err}`);
  }
};



app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Route to handle user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  connection.query('SELECT * FROM user_pass_title WHERE callsign = ? AND password = ?', [username, password], (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      // Generate a unique secret key for the user if one doesn't already exist
      if (!secretKeys[username]) {
        secretKeys[username] = uuidv4();
      }

      // Generate a JWT token for the user
      const token = jwt.sign({ username }, secretKeys[username], { expiresIn: '1h' });

      // Set the JWT token as a cookie and send a success response
      res.cookie('token', token).json({ message: 'Login successful' });
      console.log('User logged in:', username);
    } else {
      // Send an error response if the username or password is invalid
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.post('/api/changetitle',verifyToken2, setTokenCookie, (req, res) => {
  const { username } = req.body;
  const { newTitle } = req.body;

  const data = {
    username: username,
    newTitle:  newTitle,
  };
  
  fetch('https://streams.kodicable.net/receiveauthstuff', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update title');
      }
      console.log('Title updated successfully');
    })
    .catch(error => {
      console.log(error);
    });

  res.sendStatus(200);
});

app.post('/api/getstreamkey', verifyToken3, setTokenCookie, (req, res) => {
  // get username from cookie provied by verifyToken
  const { username } = req.body;

  const data = {
    username: username,
  };

  // send a request to mysql to get the stream key for the username
  connection.query('SELECT streamkey FROM user_pass_title WHERE callsign = ?', [username], (err, results, fields) => {
    // get the stream key from the results
    const streamKey = results[0].streamkey;
    // send the stream key back to the client
    res.json({ streamKey });
  });

});


app.post('/api/sendMultistreamingPoints', verifyToken3, setTokenCookie, (req, res) => {
  const { username } = req.body;
  const { points } = req.body;
  
  const data = {
    username: username,
    points: points,
  };
  if (points.length > 5) {
    res.sendStatus(413);
  } else {


    const multistreamingPointsJson = JSON.stringify(points);

    const sql = `UPDATE user_pass_title SET multistreaming_links='${multistreamingPointsJson}' WHERE callsign='${username}'`;

    connection.query(sql, (err, results, fields) => {
      if (err) {
        console.error('Error executing query:', err);
        res.sendStatus(500);
      } else {
        console.log('Multistreaming points updated successfully');

        fetch("https://live.kodicable.net/api/sendMultistreamingPoints/ub4ivor5345", {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => {
            if (!response.ok) {
              console.error('Failed to update multistreaming points');
              res.sendStatus(500);
            } else {
              // If everything is successful, send a 200 response to the client
              res.sendStatus(200);
            }
          })
          .catch(error => {
            console.error('Error during fetch request:', error);
            res.sendStatus(500);
          });
      }
    });
  }
});

app.post('/api/getMultistreamingPoints', verifyToken3, setTokenCookie, (req, res) => {

  const { username } = req.body;

  const data = {
    username: username,
  }


  connection.query('SELECT multistreaming_links FROM user_pass_title WHERE callsign = ?', [username], (err, results, fields) => {
    const multistreamingPoints = results[0].multistreaming_links;
    res.json({ multistreamingPoints });
  });

});


// Protected route for each user
app.get('/:username', verifyToken, generateSecretKey, setTokenCookie, (req, res) => {
  const { username } = req.params;
  const templateData = { user: req.user };
  res.setHeader('Content-Disposition', 'inline');
  res.render('protected-page', templateData);  
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
