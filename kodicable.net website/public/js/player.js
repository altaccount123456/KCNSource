const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let callsign = urlParams.get('stream');
    
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


let socket = new WebSocket(`ws://localhost:5000/${callsign}`)

socket.addEventListener('open', (event) => {
    console.log('Viewer connected to WebSocket server');
  });
  
  socket.addEventListener('message', (event) => {
    const message = event.data;
    console.log(`Received message: ${message}`);
  });
  
  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');
  });
  
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });



// start of logic populating stream details

const videoTitle = document.getElementById('video-title');
const videoViewers = document.getElementById('video-viewers');
const streamerPicture = document.getElementById('streamer-picture');
const streamerName = document.getElementById('streamer-name');



