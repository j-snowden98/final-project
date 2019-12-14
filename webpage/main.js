'use strict';
const url = 'http://192.168.0.5:8080';
let userID = '';

window.onload = function() {
  init();
};

document.addEventListener("keydown", event => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

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
    init();
  } catch (error) {
    console.error('Error:', error);
  }


}

async function getResidents() {
  let json = await searchResidents();
  if(json.success) {
    document.body.insertAdjacentHTML('beforeend', `
      <form class="form-inline my-2 my-lg-0">
        <input id="searchbar" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
      </form>
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

    updateResTbl(json.residents);

    document.getElementById('searchbar').addEventListener('input', (event) => {
      searchChange();
    });
    return true;
  }
  else {
    return false;
  }
}

function updateResTbl(residents) {
  document.getElementById('resTblBody').innerHTML = '';
  for(let r of residents) {
    document.getElementById('resTblBody').insertAdjacentHTML('beforeend', `
      <tr>
        <th scope="row">${r.roomName}</th>
        <td>${r.forename}</td>
        <td>${r.surname}</td>
      </tr>`);
  }
}

async function searchResidents(filter = '') {
  try {
    const response = await fetch(url + `/api/resident/search?userID=${userID}&filter=${filter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });
    const json = await response.json();
    return json;

  } catch (error) {
    console.error('Error:', error);
  }
}

function forceLogin(loadingSite) {
  const loginPg = `
    <form class="form-signin">
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
      <div class="form-group">
        <input type="text" id="inputUser" class="form-control" placeholder="Username" required="" autofocus="">
        <input type="password" id="inputPassword" class="form-control" placeholder="Password">
      </div>
      <button id="btnLogin" type="button" class="btn btn-lg btn-primary btn-block">Sign in</button>
    </form>`;

  if (loadingSite) {
    document.body.insertAdjacentHTML('beforeend', loginPg);
    document.getElementById('btnLogin').addEventListener('click', loginServer);
  }
  else {
    return;
  }
}

async function init() {
  document.body.innerHTML = '';
  let hasCookie = await getResidents();
  console.log(hasCookie);
  if (!hasCookie)
    forceLogin(true);
  else
    document.body.insertAdjacentHTML('afterBegin', navbar);
}

let timeout;
function searchChange() {
  clearTimeout(timeout);
  timeout = setTimeout(async function () {
    let results = await searchResidents(document.getElementById('searchbar').value)
    updateResTbl(results.residents);
  }, 500);
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
  </div>
</nav>`;

class ResTable {
  constructor() {

  }
}

class Resident {
  constructor() {

  }
}

class Contact {
  constructor() {

  }
}

class AddContact {
  constructor() {

  }
}

class FoodFluid {
  constructor() {

  }
}

class AddFoodFluid {
  constructor() {

  }
}
