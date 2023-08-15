const liveDiv = document.querySelector('.live-wrapper');

const apiUrl = 'http://localhost:4000/api/streams';

const loadingSilhouette = document.querySelector('.loading-silhouette');



console.log("HELLO from kodicable");



const xhr = new XMLHttpRequest();

xhr.open('GET', apiUrl);

xhr.responseType = 'json';

xhr.onload = () => {

  if (xhr.status === 200) {

     loadingSilhouette.style.display = 'none';

    const responseObj = xhr.response;

    const streams = responseObj.streams;



    for (let i = 0; i < streams.length; i++) {

      let name = streams[i].name;

      let url = streams[i].url;

      let rating = streams[i].rating;

      let viewers = streams[i].viewers;

      let live = streams[i].live;

      let title = streams[i].title;

      let thumbnail = streams[i].thumbnail;



      const streamDiv = document.createElement('div');

      streamDiv.classList.add('live');



      const infoLogoDiv = document.createElement('div');

      infoLogoDiv.classList.add('info-logo');

      



      const imgLogo = document.createElement('img');

      imgLogo.classList.add('logo');



      imgLogo.setAttribute('src', `https://kodicable.net/images/channel_logos/${name.toLowerCase()}.png`);

      if (imgLogo.src === "https://kodicable.net/images/channel_logos/wqeh.png"){

        imgLogo.style.margin = '35px 0px 15px 0px';

      }

      infoLogoDiv.appendChild(imgLogo);



      const callsignP = document.createElement('p');

      callsignP.id = 'callsign';

      callsignP.textContent = name;

      infoLogoDiv.appendChild(callsignP);

      streamDiv.appendChild(infoLogoDiv);



      const thumbnailHolderDiv = document.createElement('div');

      thumbnailHolderDiv.classList.add('thumbnail-holder');



      const a = document.createElement('a');

        a.addEventListener('click', (event) => {

        // Prevent the link from opening in a new tab

        event.preventDefault();

        // Store the callsign in local storage

        localStorage.setItem('callsign', name);

        // Redirect to player.html

        window.location.href = 'player.html?stream=' + name;

      });

      a.href = "player.html?stream=" + name;

      thumbnailHolderDiv.appendChild(a);



      const imgThumbnail = document.createElement('img');

      imgThumbnail.classList.add('thumbnail');

      if (live === 'Yes') {
        if (rating === "m")
        {
            imgThumbnail.src = "https://kodicable.net/images/mature-content.png";
        } else {
            imgThumbnail.src = thumbnail;
        }
      } else {

        imgThumbnail.src = "https://kodicable.net/images/channel_logos/Image_not_available.png";

      }

      a.appendChild(imgThumbnail);

      streamDiv.appendChild(thumbnailHolderDiv);



      const streamDetailsContainerDiv = document.createElement('div');

      streamDetailsContainerDiv.classList.add('stream-details-container');



      const streamDetailsDiv = document.createElement('div');

      streamDetailsDiv.classList.add('stream-details');



      const aTitle = document.createElement('a');

      const viewerCount = document.createElement('p');

      viewerCount.id = 'viewer-count';
      viewerCount.classList.add('viewer-count');
      viewerCount.innerHTML = `Viewers: ${viewers}`;


      aTitle.addEventListener('click', (event) => {

        // Prevent the link from opening in a new tab

        event.preventDefault();

        // Store the callsign in local storage

        localStorage.setItem('callsign', name);

        // Redirect to player.html

        window.location.href = 'player.html';

      });


      aTitle.href = "player.html";



      const titleH1 = document.createElement('h1');

      titleH1.id = 'title';

      if (live === 'Yes') {
        titleH1.innerHTML = title;
    } else {
        titleH1.innerHTML = `Channel is off the air`;
        titleH1.style.color = 'gray';
    }

      titleH1.style.fontSize = "40px";

      aTitle.appendChild(titleH1);

      streamDetailsDiv.appendChild(aTitle);



      const ratingP = document.createElement('img');

      
      if (rating === 'e'){
        ratingP.src = "https://kodicable.net/images/ratings/everyone.png"
      } else if (rating === 'p'){
        ratingP.src = "https://kodicable.net/images/ratings/parental_guidance.png"
      } else if (rating === "s"){
        ratingP.src = "https://kodicable.net/images/ratings/suggestive.png"
      } else if (rating === "m"){
        ratingP.src = "https://kodicable.net/images/ratings/mature.png"
      } else {
        ratingP.src = "https://kodicable.net/images/ratings/pending.png"
      }

      ratingP.width = "40";

      ratingP.height = "40";

      //ratingP.addEventListener('click', (event) => {
      //  alert('This channel is rated ' + rating + ' for ' + ratingFriendlyName + '.');
      //});
      // --- Future use ---

      streamDetailsDiv.appendChild(ratingP);


      streamDetailsContainerDiv.appendChild(streamDetailsDiv);

      streamDiv.appendChild(streamDetailsContainerDiv);

      liveDiv.appendChild(streamDiv);
    }

  } else {

    console.error('Request failed. ' + xhr.status);
    alert('Request failed. Please try again later.')

  }

};

xhr.send();

