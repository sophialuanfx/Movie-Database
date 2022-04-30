
//function for the sign up and loge in
let signUpBut = document.getElementById("signup");
signUpBut.onclick = signup;
let loginBut = document.getElementById("login");
loginBut.onclick = login;


function signup(){
  window.location.href = "http://localhost:3000/signup";
}
