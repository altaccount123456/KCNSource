const liveDiv = document.querySelector('.live-wrapper');

const apiUrl = 'http://localhost:4000/api/streams';



const loadingSilhouette = document.querySelector('.loading-silhouette');



console.log("HELLO from kodicable");



fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
})
.then(response => response.json())
.then(data => {
  const streams = data.streams;

  let streamsList = (Object.keys(streams))


  console.log(streamsList);

  streamsList.forEach(stream => {
      // get all data needed for each stream
      let streamName = streams[stream].name;
      let streamLive = streams[stream].live;
      let streamTitle = streams[stream].title;
      let thumbPng = streams[stream].thumbnail.png;
      let thumbGif = streams[stream].thumbnail.gif;
      let streamViewers = streams[stream].viewers;

      let isLiveText = ""
      let isLiveThumb = ""
      let isLiveTitle = ""

      if (streamLive == "Yes") {
        isLiveText = "color: white;"
        isLiveThumb = thumbPng
        isLiveTitle = streamTitle
      } else {
        isLiveText = "color: gray; font-size: 40px;"
        isLiveThumb = "/images/channel_logos/Image_not_available.png"
        isLiveTitle = "Stream is offline"
      }

      console.log(streamLive)




      const htmlCode = `
        <div class="live">
          <div class="info-logo">
            <img class="logo" src="/images/channel_logos/${streamName.toLowerCase()}.png" alt="${streamName} logo">
            <p class="callsign">${streamName}</p>
            <p class="fa-solid fa-eye viewer-count">&nbsp ${streamViewers}</p>
          </div>

          <div class="thumbnail-holder">
            <a href="player.html?stream=${streamName}">
              <img data-name="${streamName.toLowerCase()}" data-live=${streamLive} class="thumbnail" src="${isLiveThumb}" alt="${streamName} thumbnail">
            </a>
          </div>

          <div class="stream-details-container">
            <div class="stream-details">
              <a href="player.html?stream=${streamName}">
                <h1 style="${isLiveText}">${isLiveTitle}</h1>
              </a>
            </div>
          </div>
        </div>
      `

      $(`#live-wrapper`).append(htmlCode)

      $(`#loading-sil`).css("display", "none")
    })

    $(".thumbnail-holder").on("mouseenter", "img", function() {
      const streamName = $(this).data("name")
      if ($(this).data("live") == "Yes") {
        $(this).attr("src", `https://live.kodicable.net/hls${streamName}/out${streamName}.gif`)
      }
    }).on("mouseleave", "img", function() {
      const streamName = $(this).data("name")
      if ($(this).data("live") == "Yes") {
        $(this).attr("src", `https://live.kodicable.net/hls${streamName}/out${streamName}.png`)
      }
    })
})
