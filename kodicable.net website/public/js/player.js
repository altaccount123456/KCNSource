const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let callsign = urlParams.get('stream').toLowerCase();
let callsignA = callsign.toUpperCase()
    
if (callsign === null) {
    callsign = localStorage.getItem('callsign');
    callsign = callsign.toLocaleLowerCase();
    urlParams.set('stream', callsign);
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

const videoContainer = document.querySelector('.video-container');

const video = document.getElementById('my-video');
video.classList.add('video-js', 'vjs-big-play-centered');
video.setAttribute('controls', '');
video.setAttribute('preload', 'auto');
video.setAttribute('poster', `https://live.kodicable.net/hls${callsign}/out${callsign}.png`);
video.setAttribute('width', '1280');
video.setAttribute('height', '720');
video.setAttribute('data-setup', '{"liveui": true}');

const source = document.createElement('source');
source.src = `https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`;
source.type = 'application/vnd.apple.mpegurl';

video.appendChild(source);

const socket = new WebSocket(`ws://localhost:4000/api/viewer/`);


socket.onopen = ((event) => {

  socket.send(callsign);
})

socket.onmessage = ((event) => {
  console.log(event.data);
});



// start of logic populating stream details

const videoTitle = document.getElementById('video-title');
const videoViewers = document.getElementById('video-viewers');
const videoDesc = document.getElementById('stream-desc')
const streamerPicture = document.getElementById('streamer-picture');
const streamerName = document.getElementById('streamer-name');


let streamTitle, streamDescription, viewerCount;

const showDesc = document.getElementById('show-desc')
const videoStreamAboutContainer = document.getElementById("video-stream-about")

fetch("http://localhost:4000/api/streams", {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error("Network response failed" + response.statusText);
  }
  return response.json();
})
.then(data => {
  streamTitle = data.streams[callsignA].title
  streamDescription = data.streams[callsignA].description
  viewerCount = data.streams[callsignA].viewers

  videoTitle.innerHTML = streamTitle 
  videoViewers.innerHTML = ` &nbsp ${viewerCount}`
  streamerName.innerHTML = callsignA
  videoDesc.innerHTML = streamDescription.replace(/\n/g, '<br>');
  streamerPicture.src = `/images/channel_logos/${callsign}.png`



  if(videoDesc.clientHeight > 62) {
    showDesc.style.display = "block"
  } 

  
})
.catch(err => {
  console.error(`Error: ${err}`);
})




function expandDesc(){
  if (showDesc.getAttribute('data-show-hide') == "hidden") {
    videoDesc.style.webkitBoxOrient = "none"
    videoDesc.style.webkitLineClamp = "none"
    videoStreamAboutContainer.style.height = "auto"
    showDesc.innerHTML = "Show Less"
    showDesc.setAttribute('data-show-hide', "shown")
  } else {
    videoDesc.style.webkitBoxOrient = "vertical"
    videoDesc.style.webkitLineClamp = "3"
    videoStreamAboutContainer.style.height = "100px"
    showDesc.innerHTML = "Show More"
    showDesc.setAttribute('data-show-hide', "hidden")
  }
}

showDesc.addEventListener('click', (e) => {
  expandDesc();
})


function updateData() {
  fetch("http://localhost:4000/api/streams", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response failed" + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    viewerCount = data.streams[callsignA].viewers
    videoViewers.innerHTML = ` &nbsp ${viewerCount}`
  })
  .catch(err => {
    console.error(`Error: ${err}`);
  })
}

setInterval(updateData, 10000);



