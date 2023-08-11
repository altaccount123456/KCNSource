const callsign = window.location.pathname.split('/')[1];
document.title = `Live Stream Dashboard for ${callsign}`;


const overlay = document.getElementById('overlay');
const title = document.getElementById('title');
const streamKeyHolder = document.getElementById('stream-key');
const streamUrlHolder = document.getElementById('stream-url');
let streamKey = '';

const src = `https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`;
const poster = `https://live.kodicable.net/hls${callsign}/out${callsign}.png`;

const video = document.createElement('video');
video.id = 'my-video';
video.className = 'video-js vjs-big-play-centered';
video.controls = true;
video.preload = 'auto';
video.setAttribute('data-setup', '{"liveui": true}');
video.setAttribute('width', '');
video.setAttribute('height', '');

const source = document.createElement('source');
source.setAttribute('src', src);
source.setAttribute('type', 'application/vnd.apple.mpegurl');

video.appendChild(source);
video.setAttribute('poster', poster);

const videoContainer = document.getElementById('video-preview');
videoContainer.appendChild(video);
const streamHealth = document.getElementById('stream-health');

fetch(`https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`)
  .then(response => {
    if (response.ok) {
      streamHealth.textContent = 'Good';
    } else {
      streamHealth.textContent = ' Poor';
    }
  })
  .catch(error => {
    streamHealth.textContent = 'Error';
  });


fetch (`https://streams.kodicable.net/api/streams`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
})
.then(response => {
  if (!response.ok) {
    throw new Error('Failed to get title');
  }
  return response.json();
})
.then(data => {
  const callsignToFind = callsign.toLocaleUpperCase(); 
  const stream = data.streams.find(stream => stream.name === callsignToFind);
  if (stream) {
    title.innerHTML = (`${stream.title}`);
  } else {
    console.log(`Stream with callsign ${callsignToFind} not found`);
  }
})
.catch(error => {
  console.error(error);
});





fetch(`https://panel.kodicable.net/api/getstreamkey`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username: callsign })
})
.then((response) => {
  if (!response.ok) {
    throw new Error('Failed to get stream key');
  } else {
    return response.json(); // Parse the response as JSON and return the Promise
  }
})
.then((data) => {
  // Handle the parsed JSON data
  streamKey = data;
  var streamKeyElement = streamKey['streamKey'];
  streamKeyHolder.value = (`${callsign}?key=${streamKeyElement}`);
  // just gonna do both of these here lol
  streamUrlHolder.value = (`rtmp://live.kodicable.net/${callsign}`);
})
.catch((error) => {
  // Handle any errors that occurred during the fetch or JSON parsing
  console.error('Error:', error.message);
});





function changetitle() {
  const newTitle = document.getElementById('new-title').value;
  const data = {
    username: callsign,
    newTitle: newTitle,
  };

  if (newTitle === '') {
    alert('Please enter a title');
  } else{
    fetch(`https://panel.kodicable.net/api/changetitle`, {
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
  
    title.innerHTML = (`${newTitle}`);
  }
}

var r = document.querySelector(':root');



function openStreamTitleBox(){
  var rs = getComputedStyle(r);

  if (overlay.style.width === '0px' && overlay.style.height === '0px') {
    overlay.style.width = rs.getPropertyValue('--overlay-box-width');
    overlay.style.height = rs.getPropertyValue('--overlay-box-height');
  } else {
    overlay.style.width = '0px';
    overlay.style.height = '0px';
  }
}

// its late idk what i am doing anymore
function closeEditStreamTitleBox(){
  overlay.style.width = '0px';
  overlay.style.height = '0px';
}

function copyStreamKey() {
  streamKeyHolder.select();
  document.execCommand('copy');
  alert('Copied stream key to clipboard');
}

function copyStreamUrl() {
  streamUrlHolder.select();
  document.execCommand('copy');
  alert('Copied stream url to clipboard');
}


// START OF MULTISTRAMING FUNCTS
const multistreamingPointsHolder = document.getElementById('multistreaming-points');

const multistreamingContainer = document.getElementById('multistreaming-container');

const multistreamingWrapper = document.getElementById('multistreaming-wrapper');

let multistreamingPoints = [];

let maxPoints = 5;

let points = [];

function getMultistreamingPoints(){
  fetch(`https://panel.kodicable.net/api/getMultistreamingPoints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: callsign })
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to get Multistreaming points');
    } else {
      return response.json(); // Parse the response as JSON and return the Promise
    }
  })
  .then(data => {
    points = JSON.parse(data.multistreamingPoints);
    for (let i = 0; i < points.length; i++) {
      if (points[i] === '') {
        
      } else{
        var newContainer = document.createElement('div');
        newContainer.setAttribute('id', `multistreaming-container-${i}`);
        newContainer.setAttribute('class', 'multistreaming-details-container');
        multistreamingWrapper.appendChild(newContainer);
        var newPoint = document.createElement('input');
        newPoint.setAttribute('type', 'text');
        newPoint.setAttribute('id', `multistreaming-point-${i}`);
        newPoint.setAttribute('placeholder', 'Syntax: rtmp://[serverurl]/[streamkey]');
        newPoint.setAttribute('class', 'multistreaming-textbox');
        newPoint.value = points[i];
        newContainer.appendChild(newPoint);
        multistreamingPoints.push(newPoint);
      }
    }
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });


};

getMultistreamingPoints()

function addMultistreamingPoint(){
  if (multistreamingPoints.length < maxPoints) {
    var newContainer = document.createElement('div');
    newContainer.setAttribute('id', `multistreaming-container-${multistreamingPoints.length}`);
    newContainer.setAttribute('class', 'multistreaming-details-container');


    var newPoint = document.createElement('input');
    newPoint.setAttribute('type', 'text');
    newPoint.setAttribute('id', `multistreaming-point-${multistreamingPoints.length}`);
    newPoint.setAttribute('placeholder', 'Syntax: rtmp://[serverurl]/[streamkey]');
    newPoint.setAttribute('class', 'multistreaming-textbox');

    newContainer.appendChild(newPoint);
    multistreamingWrapper.appendChild(newContainer);
    multistreamingPoints.push(newPoint);
  } else {
    alert('You have reached the maximum number of multistreaming points');
  }

}

function removeMultistreamingPoint(){
  if (multistreamingPoints.length > 0) {
    var containerToRemove = document.getElementById(`multistreaming-container-${multistreamingPoints.length - 1}`);
    multistreamingWrapper.removeChild(containerToRemove);
    multistreamingPoints.pop();
  } else {
    alert('You have no multistreaming points to remove');
  }
}

function isUrlValid(urls) {
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] === '') {
      // Skip empty URLs and continue to the next iteration
      continue;
    } else if (!urls[i].startsWith('rtmp://')) {
      // If any URL is not an RTMP URL, return false immediately
      return false;
    }
  }
  // If all URLs are either empty or start with 'rtmp://', return true
  return true;
}

function saveMultistreamingPoints() {
  let points = [];
  for (let i = 0; i < multistreamingPoints.length; i++) {
    const pointValue = multistreamingPoints[i].value.trim();
    if (pointValue !== '') {
      points.push(pointValue);
    }
  }

  if (isUrlValid(points)) {
    const data = {
      username: callsign,
      points: points,
    };

    fetch('https://panel.kodicable.net/api/sendMultistreamingPoints', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 413) {
            alert('Too many multistreaming points or too few multistreaming points');
          } else if(response.status === 500){
            alert('Failed to save multistreaming points due to one of the links being invalid!');
            throw new Error('Failed to save multistreaming points');
          } 
        } else {
          alert('Multistreaming points saved successfully!');
          console.log('Multistreaming points saved successfully!');
        }
      })
      .catch(error => {
        console.error(error);
        // Handle the error as needed (e.g., display an error message to the user)
      });
  } else {
    alert(`Please enter a valid URL for each multistreaming point (has to start with "rtmp://")`);
  }
}