const express = require('express');
const app = express();
const mysql = require("mysql2")
const bodyParser = require("body-parser")
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path')

app.use(bodyParser.json())
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '/public') });
});


app.use(express.json());


function generatePushBlock(points) {
  let pushBlock = '';
  points.forEach((point, index) => {
    if (point.trim().startsWith('rtmp://')) {
      pushBlock += `push ${point.trim()};\n`;
    }
  });
  return pushBlock;
}



app.post("/api/sendMultistreamingPoints/ub4ivor5345", (req, res) => {
  const { username, points } = req.body;

  // Validate the request data
  if (!username || !points || !Array.isArray(points)) {
    return res.status(400).send('Invalid request data');
  }

  // Read the contents of the Nginx configuration file
  const nginxConfPath = `/etc/nginx/rtmp_confs/${username}.conf`;
  let nginxConfContent = `application ${username} {\n 
    live on;		# on|off. Enables this application and allowing live streaming to it. Default=on.	meta on;		# on|copy|off. Receive metadata packets containing predefined fields like width, height etc. Default=on.
    interleave off;		# on|off. Audio and video data is transmitted on the same RTMP chunk stream. Default=off.
    wait_key on;		# on|off. Makes video stream start with a key frame. Default=off.
    wait_video off;		# on|off. Disable audio until first video frame is sent (can cause delay). Default=off.
    drop_idle_publisher 10s;# Drop publisher that has been idle for this time. Only works when connection is in publish mode. Default=off
    play_restart off;	# on|off. If enabled sends "NetStream.Play.Start" and "NetStream.Play.Stop" every time publishing starts or stops. Default=off.
    idle_streams on;	# on|off. If disabled prevents viewers from connecting to idle/nonexistent streams and disconnects all. Default=on.
    hls on;				# on|off. Toggles HLS on or off for this application.
    hls_type live;			# live|event. Live plays from the current live position. Event plays from the start of the playlist. Default=live.
    hls_path /var/livestream/hls${username}; # Location to store the video fragment files. Will be created if it doesn't exist.
    hls_fragment 2s;		# Sets HLS fragment length in seconds or minutes. Default=5s.
    hls_playlist_length 1800s;	# Sets HLS playlist length in seconds or minutes. Default=30s.
    hls_sync 2ms;			# Timestamp sync threshold. Prevents crackling noise after conversion from low-res (1KHz) to high-res(90KHz). Default=2ms.
    hls_continuous off;		# on|off. In this mode HLS sequence number is started from where it stopped last time. Old fragments are kept. Default=off.
    hls_nested on;			# on|off. In this mode a subdirectory of hls_path is created for each stream. Default=off.
    hls_cleanup on;			# on|off. Nginx cache manager process removes old HLS fragments and playlist files from hls_path. Default=on.
    hls_fragment_naming system;	# system = use system time. sequential = use increasing integers. timestamp = use stream timestamp. Default=sequential.
    hls_fragment_slicing plain;	# plain|aligned. Plain: switch fragment when target duration is reached. Aligned: switch fragment when incoming timestamp is a

    ${generatePushBlock(points)}
          on_publish http://127.0.0.1:8335/publisher_auth;
  
          
      }	`;


  // Save the updated configuration file
  try {
    fs.writeFileSync(nginxConfPath, nginxConfContent, 'utf8');
    res.send('Multistreaming points updated successfully');
  } catch (error) {
    console.error('Error writing Nginx configuration file:', error);
    return res.status(500).send('Error writing Nginx configuration file');
  }

  // Restart Nginx to apply the changes
  try {
    execSync('systemctl reload nginx');
  } catch (error) {
    console.error('Error restarting Nginx:', error);
    return res.status(500).send('Error restarting Nginx');
  }

  console.log('Nginx reloaded');
});

app.post("/api/addStream/ub4ivor5345", (req, res) => {
  let {username} = req.body;
  // remove any spaces from username
  username = username.replace(/ /g, "_");
  const nginxConfPath = `/etc/nginx/rtmp_confs/${username}.conf`
  
  if (!username) {
    return res.status(400).send('Invalid request data');
  }

  // gen new conf file for nginx

  if(fs.existsSync(`/etc/nginx/rtmp_confs/${username}.conf`)) {
    return res.sendStatus(400);
  } else {

    const nginxConfTemplate = `application ${username} {\n 
      live on;		# on|off. Enables this application and allowing live streaming to it. Default=on.	meta on;		# on|copy|off. Receive metadata packets containing predefined fields like width, height etc. Default=on.
      interleave off;		# on|off. Audio and video data is transmitted on the same RTMP chunk stream. Default=off.
      wait_key on;		# on|off. Makes video stream start with a key frame. Default=off.
      wait_video off;		# on|off. Disable audio until first video frame is sent (can cause delay). Default=off.
      drop_idle_publisher 10s;# Drop publisher that has been idle for this time. Only works when connection is in publish mode. Default=off
      play_restart off;	# on|off. If enabled sends "NetStream.Play.Start" and "NetStream.Play.Stop" every time publishing starts or stops. Default=off.
      idle_streams on;	# on|off. If disabled prevents viewers from connecting to idle/nonexistent streams and disconnects all. Default=on.
      hls on;				# on|off. Toggles HLS on or off for this application.
      hls_type live;			# live|event. Live plays from the current live position. Event plays from the start of the playlist. Default=live.
      hls_path /var/livestream/hls${username}; # Location to store the video fragment files. Will be created if it doesn't exist.
      hls_fragment 2s;		# Sets HLS fragment length in seconds or minutes. Default=5s.
      hls_playlist_length 1800s;	# Sets HLS playlist length in seconds or minutes. Default=30s.
      hls_sync 2ms;			# Timestamp sync threshold. Prevents crackling noise after conversion from low-res (1KHz) to high-res(90KHz). Default=2ms.
      hls_continuous off;		# on|off. In this mode HLS sequence number is started from where it stopped last time. Old fragments are kept. Default=off.
      hls_nested on;			# on|off. In this mode a subdirectory of hls_path is created for each stream. Default=off.
      hls_cleanup on;			# on|off. Nginx cache manager process removes old HLS fragments and playlist files from hls_path. Default=on.
      hls_fragment_naming system;	# system = use system time. sequential = use increasing integers. timestamp = use stream timestamp. Default=sequential.
      hls_fragment_slicing plain;	# plain|aligned. Plain: switch fragment when target duration is reached. Aligned: switch fragment when incoming timestamp is a
  
      on_publish http://127.0.0.1:8335/publisher_auth;
    
            
      }	`;

      try {
        console.log('Writing Nginx configuration file');
        fs.writeFileSync(nginxConfPath, nginxConfTemplate, 'utf8');
    
        const mainConfPath = '/etc/nginx/rtmp_confs/mainConf.conf';
        const mainConfContent = `\n include "rtmp_confs/${username}.conf";`;
        fs.appendFileSync(mainConfPath, mainConfContent, 'utf8');
    
        try {
          execSync('systemctl reload nginx');
          return res.sendStatus(200); 
        } catch (error) {
          console.error('Error restarting Nginx:', error);
          return res.status(500).send('Error restarting Nginx');
        }
      } catch (error) {
        console.error('Error writing Nginx configuration file:', error);
        return res.status(500).send('Error writing Nginx configuration file');
      }

  }
});

app.post("/api/removeStream/ub4ivor5345", (req, res) => {
  let {username} = req.body;
  username = username.replace(/ /g, "_");
  console.log(username)
  const nginxConfPath = `/etc/nginx/rtmp_confs/${username}.conf`
  console.log(nginxConfPath)
  
  if (!username) {
    return res.status(400).send('Invalid request data');
  }


  if(fs.existsSync(nginxConfPath)) {
    try {
      fs.rmSync(nginxConfPath);
      const mainConfPath = '/etc/nginx/rtmp_confs/mainConf.conf';
      const mainConfContent = `include "rtmp_confs/${username}.conf";`;

      const data = fs.readFileSync(mainConfPath, 'utf8');
      const modifiedData = data.replace(mainConfContent, '');

      fs.writeFileSync(mainConfPath, modifiedData, 'utf8');


      try {
        execSync('systemctl reload nginx');
        return res.sendStatus(200);
      } catch {
        console.error('Error restarting Nginx:', error);
        return res.status(500).send('Error restarting Nginx');
      }


    } catch (error) {
      console.error('Error removing Nginx configuration file:', error);
      return res.status(500).send('Error removing Nginx configuration file');
    }
  } else {
    return res.status(400).send('Stream does not exist');
  }
});

app.use((req, res) => {
    res.status(404).sendFile('404.html', { root: path.join(__dirname, '/public') });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(502).sendFile('502.html', { root: path.join(__dirname, '/public') });
});


app.listen(3500, () => {
  console.log("Server is running on port 3500");
});

