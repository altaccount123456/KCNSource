const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');

const callsign = window.location.pathname.split('/')[1];

const adminOverlay = document.getElementById("admin-overlay");
const adminOverlayClose = document.getElementById("admin-overlay-close");

const adminRemoveStreamButton = document.getElementById("admin-remove-stream")
const adminConfirmRemoveStreamButton = document.getElementById("admin-confirm-remove-stream")

const adminOverlayConfirmEdit = document.getElementById("admin-overlay-editConfirm-box")
const adminOverlayConfirmClose = document.getElementById("admin-confirm-remove-stream-close")

const adminDescInput = document.getElementById("admin-new-desc");
const adminTitleInput = document.getElementById("admin-new-title");
const adminSaveButton = document.getElementById("admin-save-details");

// content rating box

const contentRatingText = document.getElementById('content-rating-text')
const contentRatingBox = document.getElementById("content-rating-box")
const contentRatingArrow = document.getElementById("content-rating-arrow")
const contentRatingDropdownBox = document.getElementById("content-rating-dropdown-box") 



let selectedStream;

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

    console.log(ratings[stream.rating])

    if (rating == undefined) {
      rating = "None"
    }
    console.log(rating)

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
})

function onOptionsClick(options) {
  let user = options.getAttribute("data-stream-name");
  selectedStream = options.getAttribute("data-stream-name");

  adminOverlay.style.width = "80%";
  adminOverlay.style.height = "550px";

  fetch("http://localhost:4000/api/streams")

}

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
      throw new Error(response.status)
  } else {
      return response.json()
  }
  })
  .then(data => {

  })
}


adminSaveButton.addEventListener("click", () =>{
  adminSaveStreamDetails()
})


function adminSaveStreamDetails(desc, title){
}



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