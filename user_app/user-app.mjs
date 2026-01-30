const signupSection = document.getElementById("signup-section");
const loginSection = document.getElementById("login-section");
const logoutDeleteSection = document.getElementById("logoutDelete-section");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const usernameSpan = document.getElementById("username");
const output = document.getElementById("output");

//--------------HTML-shit-------------

function showLoggedOutUI() {
  signupSection.style.display = "block";
  loginSection.style.display = "block";
  logoutDeleteSection.style.display = "none";
}

function showLoggedInUI(username) {
  signupSection.style.display = "none";
  loginSection.style.display = "none";
  logoutDeleteSection.style.display = "block";
  usernameSpan.textContent = username;
}

//--------------Check me----------------

async function loadCurrentUser() {
  const res = await fetch("/auth/me", {
    credentials: "same-origin"
  });

  if (!res.ok) {
    showLoggedOutUI();
    return;
  }

  const user = await res.json();
  showLoggedInUI(user.username);
}

//--------------Sign up-----------------

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  const payload = {
    username: form.username.value,
    password: form.password.value,
    acceptTos: form.acceptTos.checked
  };

  const res = await fetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);
});

//---------------Login-----------------

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  const payload = {
    username: form.username.value,
    password: form.password.value
  };

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);

  if (res.ok) {
    await loadCurrentUser();
  }
});

//--------------Logout-----------------

logoutBtn.addEventListener("click", async () => {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "same-origin"
  });

  output.textContent = "Logged out successfully";
  showLoggedOutUI();
});

//----------Delete account-------------

deleteAccountBtn.addEventListener("click", async () => {
  const confirmed = confirm(
    "Are you sure you want to delete your account?"
  );

  if (!confirmed) return;

  const res = await fetch("/auth/me", {
    method: "DELETE",
    credentials: "same-origin"
  });

  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);

  if (res.ok) {
    showLoggedOutUI();
  }
});

loadCurrentUser();