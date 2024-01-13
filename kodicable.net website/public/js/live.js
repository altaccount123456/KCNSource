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
     const keys = Object.keys(responseObj.streams);
 
     for (let i = 0; i < keys.length; i++) {
         let currentStream = responseObj.streams[keys[i]];
 
         let name = currentStream.name;
         let url = currentStream.url;
         let rating = currentStream.rating;
         let viewers = currentStream.viewers;
         let live = currentStream.live;
         let title = currentStream.title;
         let thumbnail = currentStream.thumbnail;
 


      const streamDiv = document.createElement('div');

      streamDiv.classList.add('live');



      const infoLogoDiv = document.createElement('div');

      infoLogoDiv.classList.add('info-logo');



      



      const imgLogo = document.createElement('img');

      imgLogo.classList.add('logo');



      imgLogo.setAttribute('src', `/images/channel_logos/${name.toLowerCase()}.png`);



      infoLogoDiv.appendChild(imgLogo);



      const callsignP = document.createElement('p');

      callsignP.id = 'callsign';

      callsignP.classList.add('callsign');

      callsignP.textContent = name;

      infoLogoDiv.appendChild(callsignP);

      streamDiv.appendChild(infoLogoDiv);



      const thumbnailHolderDiv = document.createElement('div');

      thumbnailHolderDiv.classList.add('thumbnail-holder');



      const a = document.createElement('a');

        a.addEventListener('click', (event) => {


        event.preventDefault();


        localStorage.setItem('callsign', name.toLowerCase());


        window.location.href = 'player.html?stream=' + name.toLowerCase();

      });

      a.href = "player.html?stream=" + name;

      thumbnailHolderDiv.appendChild(a);



      const imgThumbnail = document.createElement('img');

      imgThumbnail.classList.add('thumbnail');

      if (live === 'Yes') {
        if (rating === "m")
        {
            imgThumbnail.src = "/images/mature-content.png";
        } else {
            imgThumbnail.src = thumbnail;
        }
      } else {

        imgThumbnail.src = "/images/channel_logos/Image_not_available.png";

      }

      a.appendChild(imgThumbnail);

      streamDiv.appendChild(thumbnailHolderDiv);



      const streamDetailsContainerDiv = document.createElement('div');

      streamDetailsContainerDiv.classList.add('stream-details-container');



      const streamDetailsDiv = document.createElement('div');

      streamDetailsDiv.classList.add('stream-details');



      const aTitle = document.createElement('a');

      const viewerCount = document.createElement('p');

      viewerCount.classList.add("fa-solid");

      viewerCount.classList.add("fa-eye")

      viewerCount.id = 'viewer-count';
      viewerCount.classList.add('viewer-count');
      viewerCount.innerHTML = ` &nbsp ${viewers}`;


      aTitle.addEventListener('click', (event) => {

        // Prevent the link from opening in a new tab

        event.preventDefault();

        // Store the callsign in local storage

        localStorage.setItem('callsign', name);

        // Redirect to player.html

        window.location.href = 'player.html?stream=' + name.toLowerCase();

      });


      aTitle.href = 'player.html?stream=' + name.toLowerCase();



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




      infoLogoDiv.appendChild(viewerCount);

      streamDetailsContainerDiv.appendChild(streamDetailsDiv);

      streamDiv.appendChild(streamDetailsContainerDiv);

      liveDiv.appendChild(streamDiv);


      // START ON CARD VIEW
    }

  } else {

    console.error('Request failed. ' + xhr.status);
    alert('Request failed. Please try again later.')

  }

};

xhr.send();

