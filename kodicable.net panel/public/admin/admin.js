const accountImgHolder = document.getElementById("accountImageHolder");
const accountOpt = document.getElementById("accountOpt");
const accountOptBox = document.getElementById("account-options-box");
const accountImg = document.getElementById('account-image');
const logoutButton = document.getElementById('logoutButton');


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