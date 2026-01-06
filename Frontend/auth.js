// ===== AUTO REDIRECT IF LOGGED IN =====
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("authForm");
const toggleText = document.getElementById("toggleText");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

let isLogin = true;

// Toggle Login ↔ Register
toggleText.addEventListener("click", () => {
  isLogin = !isLogin;

  formTitle.textContent = isLogin ? "Login" : "Register";
  submitBtn.textContent = isLogin ? "Login" : "Register";
  toggleText.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";

  message.textContent = "";
  message.style.color = "red";
});

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    message.textContent = "All fields are required";
    return;
  }

  const endpoint = isLogin
    ? "http://localhost:5000/api/auth/login"
    : "http://localhost:5000/api/auth/register";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.message || "Something went wrong";
      return;
    }

    // LOGIN SUCCESS
    if (isLogin) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);

      window.location.href = "dashboard.html";
    } 
    // REGISTER SUCCESS
    else {
      message.style.color = "green";
      message.textContent = "Registered successfully! Please login.";

      isLogin = true;
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      toggleText.textContent = "Don't have an account? Register";
    }

  } catch (error) {
    message.textContent = "Unable to connect to server";
  }
});
