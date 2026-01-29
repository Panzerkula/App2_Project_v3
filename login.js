const output = document.getElementById("output");

// SIGNUP
document
  .getElementById("signup-form")
  .addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const data = {
      username: form.username.value,
      password: form.password.value
    };

    const res = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    output.textContent = JSON.stringify(result, null, 2);
  });

// LOGIN
document
  .getElementById("login-form")
  .addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const data = {
      username: form.username.value,
      password: form.password.value
    };

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    output.textContent = JSON.stringify(result, null, 2);
  });