const liveDiv = document.querySelector('.live-wrapper');
const apiUrl = 'https://streams.kodicable.net/api/streams';
const loadingSilhouette = document.querySelector('.loading-silhouette');

console.log("HELLO");

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
        window.location.href = 'player.html';
      });
      a.href = "player.html";
      thumbnailHolderDiv.appendChild(a);

      const imgThumbnail = document.createElement('img');
      imgThumbnail.classList.add('thumbnail');
      if (live === 'Yes') {
        imgThumbnail.src = thumbnail;
      } else {
        imgThumbnail.src = "https://kodicable.net/images/channel_logos/Image_not_available.png";
      }
      a.appendChild(imgThumbnail);
      streamDiv.appendChild(thumbnailHolderDiv);

      const streamDetailsContainerDiv = document.createElement('div');
      streamDetailsContainerDiv.classList.add('stream-details-container');

      const streamDetailsDiv = document.createElement('div');
      streamDetailsDiv.classList.add('stream-details');

      const ratingP = document.createElement('p');
      ratingP.innerHTML = `Rating: <i>Coming Soon</i>`;
      streamDetailsDiv.appendChild(ratingP);

      const aTitle = document.createElement('a');

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
        titleH1.innerHTML = title;
        titleH1.style.color = 'red';
    }
      aTitle.appendChild(titleH1);
      streamDetailsDiv.appendChild(aTitle);

      streamDetailsContainerDiv.appendChild(streamDetailsDiv);
      streamDiv.appendChild(streamDetailsContainerDiv);

      liveDiv.appendChild(streamDiv);
    };
  } else {
    console.error('Request failed.  Returned status of ' + xhr.status);
  }
};
xhr.send();
