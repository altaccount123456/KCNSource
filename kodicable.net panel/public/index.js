const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = loginForm.elements.username.value;
  const password = loginForm.elements.password.value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log(data);

    // Redirect to the appropriate protected page based on the user's username
    if (response.ok){
        window.location.href = `/${username}`;
    } else if (response.status === 401) {
        alert('Invalid username or password');
    } else {
        alert('Something went wrong');
    }
  } catch (error) {
    console.error(error);
  }
});

function checkCookie(){
  if(Cookies.get("user")) {
    window.location.href = `/${Cookies.get("user")}`
  }
}

checkCookie();