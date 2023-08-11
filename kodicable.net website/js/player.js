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


// ads stuff 

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded");

    var player = videojs("my-video");
    console.log("Video.js player initialized");

    var vastTagPreroll = "https://tpc.googlesyndication.com/ima3vpaid?vad_format=linear&correlator=&adtagurl=https%3A%2F%2Fpubads.g.doubleclick.net%2Fgampad%2Fads%3Fiu%3D%2F22835038530%2F1121%26description_url%3Dhttps%253A%252F%252Fkodicable.net%26tfcd%3D0%26npa%3D0%26sz%3D640x480%26max_ad_duration%3D30000%26gdfp_req%3D1%26output%3Dvast%26unviewed_position_start%3D1%26env%3Dvp%26vpos%3Dpreroll%26vpmute%3D0%26vpa%3Dauto%26type%3Djs%26hl%3Den%26vad_type%3Dlinear";
    var prerollTriggered = false;

    if (!prerollTriggered) {
      player.ima({
        adTagUrl: vastTagPreroll,
        showControlsForAds: true,
        debug: true,
      });
    } else {
      player.ima({
        adTagUrl: "",
        showControlsForAds: true,
        debug: true,
      });
    }
    console.log("IMA settings configured");

    player.ima.initializeAdDisplayContainer();
    console.log("IMA ad display container initialized");

    player.on("ended", function () {
      console.log("Video ended");
    });

    player.on("adsready", function () {
      console.log("Ads ready - preroll");
      // At this point, the preroll ad is ready to play.
      // If you have already set the video source, you can start playing the video here.
      // For example, assuming you have a video source, replace "path/to/your/video.mp4" with your actual video URL.
      player.src(`https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`);
      player.play();
    });

    player.on("aderror", function () {
      console.log("Ads aderror");
      player.play();
    });

    player.on("adend", function () {
      console.log("The preroll ad has finished playing.");
      prerollTriggered = true;
      player.play();
    });
  });
