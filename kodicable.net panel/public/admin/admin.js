const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');

const callsign = window.location.pathname.split('/')[1];

const adminOverlay = document.getElementById("admin-overlay");
const adminOverlayStreamDetails = document.getElementById("admin-overlay-stream-details");
const loadingRing = document.getElementById("loading-ring");
const adminOverlayClose = document.getElementById("admin-overlay-close");

const adminRemoveStreamButton = document.getElementById("admin-remove-stream")
const adminConfirmRemoveStreamButton = document.getElementById("admin-confirm-remove-stream")

const addStreamButton = document.getElementById("add-stream-button");
const addStreamLoadingCircle = document.getElementById("add-stream-loading-circle");
const addStreamLoadingBox = document.getElementById("add-stream-loading");

const adminOverlayConfirmEdit = document.getElementById("admin-overlay-editConfirm-box")
const adminOverlayConfirmClose = document.getElementById("admin-confirm-remove-stream-close")

const adminDescInput = document.getElementById("admin-new-desc");
const adminTitleInput = document.getElementById("admin-new-title");
const adminSaveButton = document.getElementById("admin-save-details");
const addStreamCallsign = document.getElementById("add-stream-callsign")
const addStreamTitle = document.getElementById("add-stream-title")
const addStreamFile = document.getElementById("add-stream-file");

// content rating box

const contentRatingText = document.getElementById('content-rating-text')
const contentRatingBox = document.getElementById("content-rating-box")
const contentRatingArrow = document.getElementById("content-rating-arrow")
const contentRatingDropdownBox = document.getElementById("content-rating-dropdown-box") 


const databaseHintButton = document.getElementById('database-hint-button')
const databaseHintBox = document.getElementById('hint-overlay')
const databaseHintClose = document.getElementById('database-hint-close')



let selectedStream;

let isError = false;

const streamColumns = document.getElementById("stream-columns");


fetch("http://localhost:3500/admin/database", {
  method: "GET",
  headers: {
    'Content-Type': 'application/json'
  },
})

.then(response => {
  if (!response.status === 200) {
    throw new Error(response.status)
  } else {
      return response.json()
  }
})
.then(data => {
  data.streams.forEach((stream, index) => {
    const row = document.createElement("div")
    row.classList.add("streams-row")

    const pName = document.createElement("p")
    const pStreamkey = document.createElement("p")
    const pTitle = document.createElement("p")
    const pRating = document.createElement("p")
    const pRoles = document.createElement("p")
    const options = document.createElement("i")

    const ratings = {
      e: "Everyone",
      p: "Parental Guidance",
      s: "Suggestive",
      m: "Mature",
    }

    let rating = ratings[stream.rating]


    if (rating == undefined) {
      rating = "None"
    }


    pName.innerHTML = stream.name
    pStreamkey.innerHTML = stream.streamkey
    pTitle.innerHTML = stream.title
    pRating.innerHTML = rating
    pRoles.innerHTML = stream.roles


    pName.classList.add("streams-row-value")
    pStreamkey.classList.add("streams-row-value")
    pTitle.classList.add("streams-row-value")
    pRating.classList.add("streams-row-value")
    pRoles.classList.add("streams-row-value")
    options.classList.add("fa-solid")
    options.classList.add("fa-ellipsis")
    options.classList.add("streams-options-button")

    // add event listener for options button

    options.setAttribute("data-stream-name", stream.name)

    options.addEventListener("click", () => onOptionsClick(options));


    row.appendChild(pName)
    row.appendChild(pStreamkey)
    row.appendChild(pTitle)
    row.appendChild(pRating)
    row.appendChild(pRoles)
    row.appendChild(options)

    streamColumns.appendChild(row)
  })
  // add the "add stream button" thingy
  
})




function onOptionsClick(options) {
  let user = options.getAttribute("data-stream-name");
  selectedStream = options.getAttribute("data-stream-name");


  databaseHintBox.style.width = 0
  databaseHintBox.style.padding = 0
  databaseHintBox.style.height = 0

  adminOverlay.style.width = "80%";
  adminOverlay.style.height = "550px";

  adminOverlayStreamDetails.style.display = "none";
  loadingRing.style.display = "block"

  // yes, we could cache the data in an object, however we need the most current data.

  fetch("http://localhost:4000/api/streams", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then (response => {
    if (!response.status === 200) {
      throw new Error(response.status)
    } else {
        loadingRing.style.display = "none"
        adminOverlayStreamDetails.style.display = "flex"
        return response.json()
    }
  })
  .then(data => {
    const ratings = {
      e: "Everyone",
      p: "Parental Guidance",
      s: "Suggestive",
      m: "Mature",
      undefined: "",
    }

    
    
    let ratingCode = data.streams[user].rating;

    contentRatingText.setAttribute("data-selected-rating", ratingCode);

    let rating = "";

    rating = ratings[ratingCode]

    if (rating === undefined) {
      rating = "None"
    }


    contentRatingText.innerHTML = rating
    adminTitleInput.value = data.streams[user].title
    adminDescInput.value = data.streams[user].description
  })

}

function adminSaveStreamDetails() {
  let newTitle = adminTitleInput.value
  let newDesc = adminDescInput.value
  let newRating = contentRatingText.getAttribute("data-selected-rating")
  let callsign = selectedStream
  fetch("http://localhost:3500/admin/save-stream",{
    method: "POST",
    body: JSON.stringify({ newTitle: newTitle, newDesc: newDesc, callsign: callsign, newRating: newRating}),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.status === 200) {
      isError = true
      showAlert("Couldn't save the stream. Please try again", isError)
      throw new Error(response.status)
  } else {
      showAlert("Stream saved successfully!")
      return response
  }
  })
}

adminSaveButton.addEventListener("click", () => {
  adminSaveStreamDetails()
})




adminOverlayClose.addEventListener("click", closeAdminOverlay)

function closeAdminOverlay() {
  if (adminOverlay.clientWidth > 0) {
    adminOverlay.style.width  = 0
    adminOverlay.style.height = 0
    adminOverlayConfirmEdit.style.width = 0
    adminOverlayConfirmEdit.style.height = 0
  }
}

adminOverlayConfirmClose.addEventListener("click", closeConfirmEditBox)

adminRemoveStreamButton.addEventListener("click", openConfirmEditBox)

adminConfirmRemoveStreamButton.addEventListener("click", adminRemoveStream)


function openConfirmEditBox() {
  if (adminOverlayConfirmEdit.clientWidth == 0) {
    adminOverlayConfirmEdit.style.width  = "40%"
    adminOverlayConfirmEdit.style.height = "20%"
  }
}

function closeConfirmEditBox() {
  if (adminOverlayConfirmEdit.clientWidth > 0) {
    adminOverlayConfirmEdit.style.width = 0
    adminOverlayConfirmEdit.style.height = 0
  }
}


function adminRemoveStream() {
  let streamToRemove = selectedStream
  fetch("http://localhost:3500/admin/remove-stream", {
    method: "POST",
    body: JSON.stringify({ callsign: streamToRemove }) ,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.status === 200) {
      isError = true
      showAlert("An Error has occurred while removing the stream", isError)
      throw new Error(response.status)
  } else {
      adminOverlay.style.width = 0
      adminOverlay.style.height = 0
      showAlert("Removed Stream.")
      return response.json()
  }
  })
}


// fetch to populate the admin overlay box 

// do a fetc




// CONTENT RATING BOX LOGIC
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

// initial fetch for account data
fetch("http://localhost:4000/api/streams", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
})
.then(response => {
    if (!response.status === 200) {
        throw new Error(response.status)
    } else {
        return response.json()
    }
})
.then(data => {
    const apiCallsign = data.streams[callsign.toUpperCase()]
    accountImg.src = `https://kodicable.net/images/channel_logos/${apiCallsign.name.toLowerCase()}.png`
  })
  .catch(error => {
    console.error(error);
});





// ADD STREAM LOGIC
function addStream(){ 
  let callsign = addStreamCallsign.value;
  let title = addStreamTitle.value;
  console.log(addStreamFile)
  let file = addStreamFile.files[0]

  addStreamLoadingBox.style.display = "flex";

  let formData = new FormData();
  formData.append("callsign", callsign);
  formData.append("title", title);
  formData.append("file", file);

  fetch("http://localhost:3500/admin/add-stream",{
    method: "POST",
    body: formData,
  })
  .then(response => {
    if (!response.status === 200) {
      isError = true
      showAlert("Couldn't add the stream. Please try again", isError)
      throw new Error(response.status)
  } else if (response.status === 405) {
      addStreamLoadingBox.style.display = "none"
      isError = true
      showAlert("Invalid rating format", isError)
      return response
  } else if (response.status === 422) {
      addStreamLoadingBox.style.display = "none"
      isError = true
      showAlert("Invalid file type (jpeg and png only)", isError)
      return response
  } else if(response.status === 409) {
      addStreamLoadingBox.style.display = "none"
      isError = true
      showAlert("Stream already exists!", isError)
      return response
  } else if (response.status === 400) {
    addStreamLoadingBox.style.display = "none"
    isError = true
    showAlert("No callsign or logo provided!", isError)
  } else {
      addStreamLoadingBox.style.display = "none";
      showAlert("Stream added successfully!")
      setTimeout(() => {
        location.reload()
      }, 5000)
      return response
  }
  })
}

addStreamButton.addEventListener("click", () => {
  addStream()
})






function showAlert(savedText, isError) {
    alertBoxText.innerHTML = savedText;
    alertBox.style.transform = 'translateY(-100px)';
    setTimeout(() => {
      alertBox.style.transform = 'translateY(75px)';
      isError = false;
    }, 4000)
  
    if (isError){
      alertBox.style.backgroundColor = "red"
    } else {
      alertBox.style.backgroundColor = "#0f0f0f"
    }
  
  }

  
  function displayAccountOpt() {
    if (accountOptBox.style.height == "70px") {
      accountOptBox.style.height = "0px"
    } else {
      accountOptBox.style.height = "70px"
    }
  }

  accountImgHolder.addEventListener("click", displayAccountOpt )



  // logic for rating button

  function displayDBHint() {
    if (parseInt(databaseHintBox.style.width) > 0) {
      databaseHintBox.style.width = 0
      databaseHintBox.style.padding = 0
      databaseHintBox.style.height = 0
    } else {
      databaseHintBox.style.width = "40%"
      databaseHintBox.style.height = "350px"
      databaseHintBox.style.padding = "10px"

      adminOverlay.style.width = "0";
      adminOverlay.style.height = "0";
    }
  }

  databaseHintClose.addEventListener("click", () => {
    displayDBHint();
  })

  databaseHintButton.addEventListener("click", () => {
    displayDBHint();
  })


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