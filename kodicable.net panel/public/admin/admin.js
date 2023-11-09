const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');

const callsign = window.location.pathname.split('/')[1];


// const callsignColumn = document.getElementById("callsign-column");
// const streamkeyColumn = document.getElementById("streamkey-column");
// const titleColumn = document.getElementById("title-column");
// const ratingColumn = document.getElementById("rating-column");
// const rolesColumn = document.getElementById("roles-column");

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


    row.appendChild(pName)
    row.appendChild(pStreamkey)
    row.appendChild(pTitle)
    row.appendChild(pRating)
    row.appendChild(pRoles)

    streamColumns.appendChild(row)
  })
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