import { videoAppeneded } from "./index-protected.js";

document.addEventListener("DOMContentLoaded", function() {
    if (videoAppeneded) {
        var player = videojs('my-video')
    
        player.on('volumechange', function() {
            var currentVolume = Math.round(player.volume() * 100) / 100;
    
            var isMuted = player.muted()
            
    
    
           localStorage.setItem("videojs_volume", currentVolume)
        })
    
        // now lets get the value!
        player.ready(function() {
            if (localStorage.getItem("videojs_volume") !== null) {
                player.volume(parseFloat(localStorage.getItem("videojs_volume")));
            } else {
                player.volume(0.50)
            }
        });
    }
})