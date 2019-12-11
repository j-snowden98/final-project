'use strict';
const url = 'http://localhost:8080';
let userID = '';

window.onload = function() {
  getResidents();
}
document.addEventListener("keydown", event => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

document.getElementById('btnLogin').addEventListener('click', loginServer);

async function loginServer() {
  let usr = document.getElementById('inputUser').value;
  let pass = document.getElementById('inputPassword').value;
  console.log(usr);
  console.log(pass);

  const data = { username: usr, password: pass };

  try {
    const response = await fetch(url + '/user/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    userID = json.userID;
    getResidents();
  } catch (error) {
    console.error('Error:', error);
  }


}

async function getResidents() {
  try {
    const response = await fetch(url + `/api/resident/search?userID=${userID}&filter=${''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });
    const json = await response.json();
    console.log(JSON.stringify(json));
    if(json) {
      document.body.insertAdjacentHTML('beforeend', `
        <table class="table table-striped table-dark">
          <thead>
            <tr>
              <th scope="col">Room</th>
              <th scope="col">Forename</th>
              <th scope="col">Surname</th>
            </tr>
          </thead>
          <tbody id="resTblBody">
          </tbody>
        </table>`);

      for(let r of json) {
        document.getElementById('resTblBody').insertAdjacentHTML('beforeend', `
          <tr>
            <th scope="row">${r.roomName}</th>
            <td>${r.forename}</td>
            <td>${r.surname}</td>
          </tr>`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }


}

let navbar = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Navbar</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Dropdown
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#">Something else here</a>
        </div>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
      </li>
    </ul>
    <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
  </div>
</nav>`;
