const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ftp = require('basic-ftp');
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
const bodyParser = require('body-parser');
const { connect } = require('http2');

const webhookClient = new WebhookClient('1119420522900504607', 'TEaM_uCWqPcDzYdq9zx8TRuZRSs7gHiMfUG7wwZH9eL_NPz4sDIqAP9m5sVDNKub_dzz');

let maxDescCharCount = 2000
let maxTitleCharCount = 100

app.use(cors());


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
  console.log(token)

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { username } = decoded;
    req.user = { username };
    console.log(req.user)
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


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json()); 
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

      console.log(username)
      const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '30d' });

      res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 2592000000 })
      res.cookie('user', `${username}`, { httpOnly: false, secure: false, maxAge: 2592000000 })
      res.json(`${username}`);
    } else {
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

  const { username } = req.user;

  const data = {
    username: username,
  };


  connection.query('SELECT streamkey FROM user_pass_title WHERE callsign = ?', [username], (err, results, fields) => {

    const streamKey = results[0].streamkey;

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
          headers: {
             'Content-Type': 'application/json' 
          },
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
// these functions are very powerful, make sure we auth. use "checkIfAdmin" middleware function


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
      console.log("Admin Authenticated", callsign)
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
      streamkey: `${row.callsign.toLowerCase()}?key=${row.streamkey}`,
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
      fetch("https://live.kodicable.net/api/removeStream/ub4ivor5345", {
        method: 'POST',
        body: JSON.stringify({username: callsign}),
        headers: { 'Content-Type': 'application/json' },
      })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to remove stream');
          console.log(response)
          res.sendStatus(500);
        } else {
          res.status(200).send("Remove successful");
        }
      })
    } else {
      res.status(404).send("No records updated");
    }
  });
})


const fileFilter = (req, file, cb) => {
  const whitelist = ['image/png', 'image/jpeg', 'image/gif']

  if (whitelist.includes(file.mimetype)) {
    // accept file

    cb(null, true);
  } else {
    cb(new Error('Invalid file type:'), false)
  }
}

const fileDest = '../kodicable.net website/public/images/channel_logos/'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fileDest)
  },
  filename: function (req, file, cb) {
    const callsign = req.body.callsign.toLowerCase();
    const fileName = `${callsign}.png`
    cb(null, fileName)
  }
})
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
})

app.post("/admin/add-stream", upload.single('file'), verifyToken, checkIfAdmin, async (req, res) => {

  let { callsign, title} = req.body
  const file = req.file

  callsign = callsign.toLowerCase();



  if (callsign !== "" && file !== undefined) {
     // check if user already exists
    function userExists() {
      return new Promise((resolve, reject) => {
        const existQuery = "SELECT * FROM user_pass_title WHERE callsign = ?"
        connection.query(existQuery, [callsign], (err, results) => {
          if (err) {
            console.error(err)
            reject (res.status(500).send("An Internal Server Error Occurred"))
          }
    
          console.log(results)
          if (results.length > 0) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
      })
    }
  
    userExists().then((exists) => {
      if (exists) {
        console.log("User already exists")
        return res.status(409).send("User already exists")
      } else {
        function generatePassword(length) {
          var result = '';
          var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
      
          for (var i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
      
          return result;
        }
      
        let streamkey = generatePassword(16);
      
      
      
      
      
      
      
      
        
        const query = "INSERT INTO user_pass_title (callsign, streamkey, password, title, rating, viewers, viewer_graph, roles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      
        connection.query(query, [callsign, streamkey, streamkey, title, "e", 0, "[{}]", '{"admin": false, "participant": true}'], (err, results) => {
          if (err) {
            console.error(err)
            return res.status(500).send("err")
          }
          // add stream into stream server
          fetch("https://live.kodicable.net/api/addStream/ub4ivor5345", {
            method: 'POST',
            body: JSON.stringify({username: callsign}),
            headers: { 'Content-Type': 'application/json' },
          })
          .then(response => {
            if (!response.ok) {
              console.error('Failed to add stream');
              console.log(response)
              res.sendStatus(500);
            } else {
              res.sendStatus(200);
            }
          })
          .catch(error => {
            console.error('Error during fetch request:', error);
            res.sendStatus(500);
          });
        })
      }
    }).catch((err) => {
      return res.status(500).send("An Internal Server Error Occurred")
    })
  } else {
    res.status(400).send("No callsign provided")
  }


}, (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
      res.status(400).send("unknown error");
      console.log(error);
  } else if (error) {
      res.status(422).send(error);
  }
})

// next we do nginx rtmp "on_publish"

app.post("/api/on_publish", (req, res) => {

  const callsign = req.body.name;

  const unixTimestamp = Math.floor(Date.now() / 1000);
  console.log(unixTimestamp);

  const query = "UPDATE user_pass_title SET last_stream = ? WHERE callsign = ?"

  connection.query(query, [unixTimestamp, callsign], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send("An Internal Server Error Occurred")
    }
    res.status(200).send("Added")
  })
})

app.get("/api/role_check", verifyToken, checkIfAdmin, (req, res) => {
  res.sendStatus(200)
});

// Protected route for each user
app.get('/:username', verifyToken, (req, res) => {
  const { username } = req.params;
  // basic check to see if the verify token's username is the same as the params username
  if (req.user.username === username) {
    const templateData = { user: req.user };
    res.setHeader('Content-Disposition', 'inline');
    res.render('protected-page', templateData);
  } else {
    res.status(403).sendFile(path.join(__dirname, 'public', '403.html'));
  }
});

app.get("/:username/admin-panel", verifyToken, checkIfAdmin, (req, res) => {
  checkAdminWeb(req, res)
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
 