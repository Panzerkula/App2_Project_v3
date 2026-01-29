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

/* Need to wire up backend>frontend properly before using these handlers

//-------------------Log out------------------------

document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    loadAuthState();
});

//----------------Delete account--------------------

document.getElementById("delete-account-btn").addEventListener("click", async () => {
    const confirmed = confirm(
        "Are you sure you want to delete your account?"
    );

    if (!confirmed) return;

    const res = await fetch("/auth/me", {
        method: "DELETE"
    });

    const result = await res.json();
    output.textContent = JSON.stringify(result, null, 2);

    if (res.ok) {
        alert("Your account has been deleted.");
        loadAuthState();
    }
  });
*/

//--------------------Auth---------------------------

async function loadAuthState() {
    const res = await fetch("/auth/me");

    if (res.ok) {
        const user = await res.json();
        authSection.style.display = "none";
        appSection.style.display = "block";
        usernameSpan.textContent = user.username;
    /*} else {
        usernameSpan.textContent = "Non-user"
    }*/
}

loadAuthState();
}