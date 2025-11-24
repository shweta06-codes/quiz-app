// --------------------- Signup & Login (users) ---------------------
function signup(){
  const user = document.getElementById("newUser").value.trim();
  const pass = document.getElementById("newPass").value.trim();
  if(!user || !pass){ alert("Enter username & password"); return; }

  if(localStorage.getItem("user_" + user)){
    alert("User already exists");
    return;
  }
  // store simple user record
  localStorage.setItem("user_" + user, pass);
  alert("Account created. Please login.");
  showLogin();
}

function login(){
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  if(!user || !pass){ alert("Enter username & password"); return; }

  const saved = localStorage.getItem("user_" + user);
  if(saved && saved === pass){
    localStorage.setItem("loggedUser", user);
    window.location.href = "profile.html";
  } else {
    alert("Invalid credentials");
  }
}

function showSignup(){
  document.getElementById("login-card").classList.add("hide");
  document.getElementById("signup-card").classList.remove("hide");
}
function showLogin(){
  document.getElementById("signup-card").classList.add("hide");
  document.getElementById("login-card").classList.remove("hide");
}

// --------------------- Profile page initialization ---------------------
if (window.location.pathname.endsWith("profile.html")){
  const user = localStorage.getItem("loggedUser");
  if(!user){ window.location.href = "index.html"; }

  document.getElementById("username-display").innerText = user;

  const history = JSON.parse(localStorage.getItem(user + "_scores")) || [];
  document.getElementById("attempts").innerText = history.length;
  document.getElementById("bestScore").innerText = history.length? Math.max(...history) : 0;
  document.getElementById("lastScore").innerText = history.length? history[history.length-1] : '-';
}

function startQuiz(){ window.location.href = "quiz.html"; }
function goAdmin(){ window.location.href = "admin.html"; }

function logout(){
  localStorage.removeItem("loggedUser");
  // do not remove admin credentials
  window.location.href = "index.html";
}
