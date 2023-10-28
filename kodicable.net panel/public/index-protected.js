const callsign = window.location.pathname.split('/')[1];
document.title = `Live Stream Dashboard for ${callsign}`;
let isError = false;


const overlay = document.getElementById('overlay');


const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');


const body = document.getElementById('body');


const alertBox = document.getElementById('alertBox');
const alertBoxText = document.getElementById('alertBoxText');


const title = document.getElementById('title');
const viewerCount = document.getElementById('viewer-count');
const streamKeyHolder = document.getElementById('stream-key');
const streamUrlHolder = document.getElementById('stream-url');
const newTitleHolder = document.getElementById('new-title');
const newDescHolder = document.getElementById('new-desc');
const contentRatingText = document.getElementById('content-rating-text')
const contentRatingBox = document.getElementById("content-rating-box")
const contentRatingArrow = document.getElementById("content-rating-arrow")
const contentRatingDropdownBox = document.getElementById("content-rating-dropdown-box") 


let streamKey = '';

const src = `https://live.kodicable.net/hls${callsign}/${callsign}/index.m3u8`;
const poster = `https://live.kodicable.net/hls${callsign}/out${callsign}.png`;

const video = document.createElement('video');
video.id = 'my-video';
video.className = 'video-js vjs-big-play-centered';
video.controls = true;
video.preload = 'auto';
video.autoplay = true;
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
    console.error(error);
    streamHealth.textContent = 'Error';
  });


function streamInfo(){
  fetch (`http://localhost:4000/api/streams`, {
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
    const apiCallsign = data.streams[callsign.toUpperCase()]

    title.innerHTML = apiCallsign.title
    newTitleHolder.value = apiCallsign.title
    accountImg.src = `https://kodicable.net/images/channel_logos/${apiCallsign.name.toLowerCase()}.png`
    newDescHolder.innerHTML = apiCallsign.description
    viewerCount.innerHTML = apiCallsign.viewers
  })
  .catch(error => {
    console.error(error);
  });
}

streamInfo();
setInterval(streamInfo, 15000);



function streamDetails(){
  fetch(`http://localhost:3500/api/getstreamkey`, {
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
      return response.json();
    }
  })
  .then((data) => {
    streamKey = `wpey?key=${data.streamKey}`;
    streamKeyHolder.value = streamKey
    streamUrlHolder.value = (`rtmp://live.kodicable.net/${callsign}`);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

}

streamDetails()

// I put it in a function just to be organized 




function saveStreamDetails() {
  const newTitle = document.getElementById('new-title').value;
  const newDesc = document.getElementById('new-desc').value;
  const data = {
    username: callsign,
    newTitle: newTitle,
    newDesc: newDesc
  };

  if (newTitle === '') {
    isError = true;
    showAlert("Please enter a title", isError)
  } else{
    fetch(`http://localhost:3500/api/changedetails`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (response.status === 406){
          isError = true;
          showAlert("Too many characters!", isError)
        } else if (response.status === 200){
          console.log('Stream details updated successfully');
          showAlert("Stream details updated successfully!");
        } else {
          isError = true;
          showAlert("An error occurred", isError)
        }
      })
      .catch(error => {
        isError = true;
        showAlert("Failed to update stream details")
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
  console.log(streamKey)
  navigator.clipboard.writeText(streamKey).then(showAlert('Copied stream key to clipboard', false))
  
}

function copyStreamUrl() {
  streamUrlHolder.select();
  document.execCommand('copy');
  showAlert('Copied stream url to clipboard', false);
}


// START OF MULTISTRAMING FUNCTS
const multistreamingPointsHolder = document.getElementById('multistreaming-points');

const multistreamingContainer = document.getElementById('multistreaming-container');

const multistreamingWrapper = document.getElementById('multistreaming-wrapper');

let multistreamingPoints = [];

let maxPoints = 5;

let points = [];

function getMultistreamingPoints(){
  fetch(`http://localhost:3500/api/getMultistreamingPoints`, {
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
    isError = true;
    showAlert('Maximum number of multistreaming points reached!', isError);
  }

}

function removeMultistreamingPoint(){
  if (multistreamingPoints.length > 0) {
    var containerToRemove = document.getElementById(`multistreaming-container-${multistreamingPoints.length - 1}`);
    multistreamingWrapper.removeChild(containerToRemove);
    multistreamingPoints.pop();
  } else {
    isError = true
    showAlert('You have no multistreaming points to remove', isError);
  }
}

function isUrlValid(urls) {
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] === '') {
      continue;
    } else if (!urls[i].startsWith('rtmp://')) {
      return false;
    }
  }
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

    fetch('http://localhost:3500/api/sendMultistreamingPoints', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 413) {
            alert('Too many multistreaming points or too few multistreaming points');
          } else if(response.status === 500){
            isError = true;
            showAlert("Failed to save multistreaming points due to one of the links being invalid!", isError)
            throw new Error('Failed to save multistreaming points');
          } 
        } else {
          showAlert("Multistreaming Points Saved!")
          console.log('Multistreaming points saved successfully!');
        }
      })
      .catch(error => {
        console.error(error);
        // Handle the error as needed (e.g., display an error message to the user)
      });
  } else {
    isError = true;
    showAlert(`Please enter a valid URL (has to start with "rtmp://")`, isError);
  }
}

let rotated = false;
let dropped = false;

function contentRatingDropdown(){
  // stuff for arrow
  if (rotated){
    contentRatingArrow.style.transform = ''
    rotated = false;
  } else {
    contentRatingArrow.style.transform = 'rotate(90deg)';
    rotated = true
  }

  // stuff for dropdown 

  if (dropped){
    contentRatingDropdownBox.style.height = "0"
    dropped = false
  } else {
    contentRatingDropdownBox.style.height = "120px"
    dropped = true
  }
}

contentRatingBox.addEventListener('click', contentRatingDropdown)


// content rating logic

contentRatingDropdownBox.addEventListener('click', function(e){
  const clickedItem = e.target.closest('.content-rating-button');

  if(clickedItem && contentRatingDropdownBox.contains(clickedItem)) {
    const rating = clickedItem.getAttribute('data-rating-text');
    const ratingShort = clickedItem.getAttribute('data-rating');
    contentRatingText.innerHTML = rating
    contentRatingText.setAttribute("data-selected-rating", ratingShort)
  }
})

function saveContentRating(){
  const rating = contentRatingText.getAttribute('data-selected-rating');

  console.log(rating);
}


function hideShowKey(){
  const hiddenEye = document.getElementById('hidden-eye');
  const visibleEye = document.getElementById('visible-eye');

  // use display none to hide the key
  if (hiddenEye.style.display === 'none') {
    hiddenEye.style.display = 'block';
    visibleEye.style.display = 'none';
    streamKeyHolder.type = "password";
  } else {
    hiddenEye.style.display = 'none';
    visibleEye.style.display = 'block';
    streamKeyHolder.type = "text";
  }

}

// the alert box


function showAlert(savedText, isError) {
  alertBoxText.innerHTML = savedText;
  alertBox.style.transform = 'translateY(-100px)';
  setTimeout(() => {
    alertBox.style.transform = 'translateY(100px)';
    isError = false;
  }, 4000)

  if (isError){
    alertBox.style.backgroundColor = "red"
  } else {
    alertBox.style.backgroundColor = "#0f0f0f"
  }

}


// logic for clicking on account image
function displayAccountOpt() {
  if (accountOptBox.style.height == "70px") {
    accountOptBox.style.height = "0px"
  } else {
    accountOptBox.style.height = "70px"
  }
}


accountImgHolder.addEventListener("click", displayAccountOpt )



// logout logic 

function logout() {
  fetch(`http://localhost:3500/api/logout`, {
    method: 'GET',
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to logout');
    } else {
      console.log('Logged out');
      window.location.href = "/"
    }
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

}


logoutButton.addEventListener("click", logout)