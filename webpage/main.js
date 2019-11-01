document.getElementById('login').addEventListener('click', loginServer);

async function loginServer() {
  let usr = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  console.log(usr);
  console.log(pass);
}
