const output = document.getElementById("output");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const usernameSpan = document.getElementById("username");

//------------------Sign up----------------------

document.getElementById("signup-form").addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;

    const data = {
        username: form.username.value,
        password: form.password.value,
        acceptTos: form.acceptTos.checked,
        acceptPrivacy: form.acceptPrivacy.checked
    };

    const res = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    output.textContent = JSON.stringify(result, null, 2);
    
    if (res.ok) {
        loadAuthState();
    }
  });

//-------------------Log in------------------------

document.getElementById("login-form").addEventListener("submit", async e => {
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

    if (res.ok) {
        loadAuthState();
    }
});

//-------------------Log out------------------------

document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    loadAuthState();
});

//-------------------Auth---------------------------

async function loadAuthState() {
    const res = await fetch("/auth/me");

    if (res.ok) {
        const user = await res.json();
        authSection.style.display = "none";
        appSection.style.display = "block";
        usernameSpan.textContent = user.username;
    } else {
        authSection.style.display = "block";
        appSection.style.display = "none";
    }
}

loadAuthState();