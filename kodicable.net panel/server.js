const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3500;
const mysql2 = require('mysql2');
const { MessageEmbed, WebhookClient } = require('discord.js');
const { connect } = require('http2');

const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');

let maxDescCharCount = 2000
let maxTitleCharCount = 100


const connection = mysql2.createConnection({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Generate a unique secret key for each user
let secretKeys = {}
const generateSecretKey = (req, res, next) => {
  const { username } = req.user;
  if (!secretKeys[username]) {
    secretKeys[username] = uuidv4();
    
  }

  next();
};


const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const { username } = jwt.verify(token, process.env.SECRET_KEY);
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
    const { username } = jwt.verify(token, process.env.SECRET_KEY);
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
    const { username } = jwt.verify(token, process.env.SECRET_KEY);
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
app.post('/login',  (req, res) => {
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
      const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '30d' });

      // Set the JWT token as a cookie and send a success response
      res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 2592000000 })
      res.cookie('user', `${username}`, { httpOnly: false, secure: false, maxAge: 2592000000 })
      res.json(`${username}`);
    } else {
      // Send an error response if the username or password is invalid
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.get('/api/logout', (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.json({"logged out?" : "true"});
})

function sendEmbed(username, fieldName1, fieldName2, fieldValue1, fieldValue2) {
  const embed = new MessageEmbed()
  .setTitle(`Stream Details Changed for ${username}! `)
  .setDescription(`**${fieldName1}:** ${fieldValue1} \n \n \n **${fieldName2}:** ${fieldValue2}`)
  .setColor('#0099ff')
  .setTimestamp();
  webhookClient.send(embed)
}


// changes desc and title only
app.post('/api/changedetails',verifyToken2, (req, res) => {
  const fieldName1 = "Title"
  const fieldName2 = "Description"
  const { username, newTitle, newDesc } = req.body;


  const query = `UPDATE user_pass_title SET title='${newTitle}', description='${newDesc}' WHERE callsign='${username}'`;
  connection.query(query, (error, results, fields) => {
    if (error){
      res.sendStatus(500)
      console.log(error)
    } else if (newTitle.length > maxTitleCharCount || newDesc.length > maxDescCharCount){
      // its too long
      res.sendStatus(406)
    } else {
      sendEmbed(username, fieldName1, fieldName2, newTitle, newDesc)
      res.sendStatus(200)
    }
  })

});

app.post("/api/checkcookie", verifyToken, (req, res) => {
  res.sendStatus(200)
});


app.post('/api/changerating',verifyToken2, (req, res) => {
  const { username } = req.body;
  const { newRating } = req.body;
  try{
    const query =  `UPDATE user_pass_title SET rating='${newRating}' WHERE callsign='${username}'`;
    connection.query(query, (error, results, fields) => {
      if (error) {
        console.error(`Error updating rating for ${username}:`, error);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    })
  } catch(error){
    res.sendStatus(500);
  }
});

app.post('/api/getstreamkey', verifyToken3, (req, res) => {
  // get username from cookie provied by verifyToken
  const { username } = req.user;

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


app.post('/api/sendMultistreamingPoints', verifyToken3, (req, res) => {
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

app.post('/api/getMultistreamingPoints', verifyToken3, (req, res) => {

  const { username } = req.body;

  const data = {
    username: username,
  }


  connection.query('SELECT multistreaming_links FROM user_pass_title WHERE callsign = ?', [username], (err, results, fields) => {
    const multistreamingPoints = results[0].multistreaming_links;
    res.json({ multistreamingPoints });
  });

});

app.post('/api/changerating', verifyToken2, (req, res) => {
  const { username } = req.body;
  const { newRating } = req.body;
  try{
    const query =  `UPDATE user_pass_title SET rating='${newRating}' WHERE callsign='${username}'`;
    connection.query(query, (error, results, fields) => {
      if (error) {
        console.error(`Error updating rating for ${username}:`, error);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    })
  } catch(error){
    res.sendStatus(500);
  }
});



// ADMIN POINTS
// these functions are very powerful, make sure we auth.


// FOR ADMIN APP POINTS ONLY (a middleware function that handles auth for admins)
const checkIfAdmin = (req, res, next) => {

  const callsign = req.user.username;

  connection.query('SELECT roles FROM user_pass_title WHERE callsign = ?', callsign, (err, results, fields) => {
    if (err) {
      console.error('An error occurred:', err);
      return res.status(500).send('An error occurred while fetching the roles.');
    }

    if (results.length === 0) {
      return res.status(403).send('Access Denied');
    }
  
  

  try {
    const rolesObject = JSON.parse(results[0].roles);


    const isAdmin = rolesObject.admin;


    if (isAdmin === true) {
      next();
    } else {
      return res.status(403).send("False")
    }

  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    return res.status(500).send('An error occurred while parsing the roles data.');
  }
});
};


function checkAdminWeb(req, res) {
  const callsign = req.user.username;

  connection.query('SELECT roles FROM user_pass_title WHERE callsign = ?', callsign, (err, results, fields) => {
    if (err) {
      console.error('An error occurred:', err);
      return res.status(500).send('An error occurred while fetching the roles.');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found.');
    }
  
  

  try {
    const rolesObject = JSON.parse(results[0].roles);


    const isAdmin = rolesObject.admin;

    console.log(isAdmin);  

    if (isAdmin === true) {
      const templateData = { user: req.user };
      res.setHeader('Content-Disposition', 'inline');
      res.render('admin-panel', templateData);
    } else {
      return res.status(403).send("False")
    }

  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    return res.status(500).send('An error occurred while parsing the roles data.');
  }
});
}



let cachedData = []

async function populateData(links) {
  const streams = []
  for (const link of links) {
    const streamMetadata = {
      name: link.name,
      streamkey: link.streamkey,
      title: link.title,
      rating: link.rating,
      roles: link.roles,
    }
    streams.push(streamMetadata)
  }

  return streams
}

async function readFromDatabase() {
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
      streamkey: row.streamkey,
      title: row.title,
      rating: row.rating,
      roles: row.roles,
    };
  });

  return links;
}

async function updateCachedData() {
  try {
    const links = await readFromDatabase();
    const availableStreams = await populateData(links);
    cachedData = availableStreams;
  } catch (error) {
    console.error('Error updating cached streams:', error);
  }

  setTimeout(updateCachedData, 5 * 1000); // Refresh every 5 seconds
}

updateCachedData();

app.get("/admin/database", verifyToken, checkIfAdmin, async (req, res) => {
  res.json({ streams: cachedData })
})

app.post("/admin/save-stream", verifyToken, checkIfAdmin, (req, res) => {
  let { callsign, newTitle, newDesc, newRating } = req.body;

  callsign = callsign.toLowerCase();

  const query = "UPDATE user_pass_title SET title = ?, description = ?, rating = ? WHERE callsign = ?"
  connection.query(query, [newTitle, newDesc, newRating, callsign], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send("An Internal Server Error Occurred")
    }

    if (results.affectedRows > 0) {
      res.status(200).send("Update successful");
   } else {
      res.status(404).send("No records updated");
   }
  });
})

app.post("/admin/remove-stream", verifyToken, checkIfAdmin, (req, res) => {
  let { callsign }  = req.body

  callsign = callsign.toLowerCase();
  
  console.log(callsign)

  const query = "DELETE FROM user_pass_title WHERE callsign = ?"
  connection.query(query, [callsign], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send("An Internal Server Error Occurred")
    }
    if (results.affectedRows > 0) {
      res.status(200).send("Remove successful");
    } else {
      res.status(404).send("No records updated");
    }
  });
})

app.post("/admin/add-stream", verifyToken, checkIfAdmin, (req, res) => {
  let { callsign, rating, title} = req.body
  
  const query = "INSERT INTO user_pass_title (callsign, streamkey, title) VALUES (?, ?, ?)"

  connection.query(query, [callsign, streamkey, title], (err, results) => {
    if (err) {
      console.error(err)
      return;
    }
    console.log("Added Stream:" + results)
  })
})

// Protected route for each user
app.get('/:username', verifyToken, (req, res) => {
  const { username } = req.params;
  const templateData = { user: req.user };
  res.setHeader('Content-Disposition', 'inline');
  res.render('protected-page', templateData);  
});

app.get("/:username/admin-panel", verifyToken, (req, res) => {
  checkAdminWeb(req, res)
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
 