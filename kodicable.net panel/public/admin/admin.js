const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');

const callsign = window.location.pathname.split('/')[1];


const callsignColumn = document.getElementById("callsign-column");
const streamkeyColumn = document.getElementById("streamkey-column");
const titleColumn = document.getElementById("title-column");
const ratingColumn = document.getElementById("rating-column");
const rolesColumn = document.getElementById("roles-column");


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