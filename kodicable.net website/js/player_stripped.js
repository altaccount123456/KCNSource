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
video.classList.add('vjs-fluid', 'vjs-16-9');
video.setAttribute('controls', 'hidden');
video.setAttribute('preload', 'auto');
video.setAttribute('autoplay', 'true');
video.setAttribute('muted', 'true')
video.setAttribute('poster', `https://live.kodicable.net/hls${callsign}/out${callsign}.png`);
video.setAttribute('width', '1280');
video.setAttribute('height', '720');
video.setAttribute('data-setup', '{}');

const source = document.createElement('source');
source.src = `https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`;
source.type = 'application/vnd.apple.mpegurl';

video.appendChild(source);