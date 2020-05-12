'use strict';
const url = document.location.origin;
let navbar = false;
let resTbl;
let main;


window.onload = function() {
  //Prepare the initial residents list view upon loading the page
  init();
};

document.addEventListener("keydown", event => {
  //When forms are being used, prevents enter from submitting and reloading page.
  if(event.keyCode === 13) {
    event.preventDefault();
  }
});

function init() {
  //This code is called when the page is loaded. Creates a new instance of resTbl, which will display the residents list view.
  main = document.getElementsByTagName('main')[0];
  resTbl = new ResTable();
}

function forceLogin() {
  //Add login form to page
  const loginPg = `
    <form class="form-signin" id="signin">
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
      <div class="form-group">
        <input type="text" id="inputUser" class="form-control" placeholder="Username" required="" autofocus="">
        <input type="password" id="inputPassword" class="form-control" placeholder="Password">
      </div>
      <button id="btnLogin" type="button" class="btn btn-lg btn-primary btn-block">Sign in</button>
    </form>`;

  main.insertAdjacentHTML('beforeend', loginPg);
  document.getElementById('btnLogin').addEventListener('click', loginServer.bind(this));

  //Disables the admin and report buttons, if they exist
  const adminBtn = document.getElementById('adminBtn');
  const reportBtn = document.getElementById('reportBtn');
  if(adminBtn !== null)
    adminBtn.removeEventListener('click', loadAdmin);
  
  if(reportBtn !== null)
    reportBtn.removeEventListener('click', loadReport);
}

async function loginServer() {
  //This function will send a login request to the server with entered credentials
  let usr = document.getElementById('inputUser').value;
  let pass = document.getElementById('inputPassword').value;

  const data = { username: usr, password: pass };

  try {
    const response = await fetch(url + '/account/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    //Check status of response to determine what to do next
    const status = await response.status;
    if(status === 401) {
      //Alert the user that the credentials they entered were incorrect
      clearError();
      document.getElementById('signin').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">${await response.text()}</div>`);
    }
    else if (status === 500) {
      //Alert user of an error with the server
      clearError();
      document.getElementById('signin').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.</div>`);
    }
    else {
      const json = await response.json();
      document.getElementById('signin').outerHTML = '';

      //Adds the navbar if it's not already there; user is now authenticated
      //passes username from response to the navbar as well as their report and admin permission
      if(!navbar)
        addNavbar(json.username, json.admin, json.report);
      else {
        //Allows the admin and report buttons to be clicked again, if they exist
        const adminBtn = document.getElementById('adminBtn');
        const reportBtn = document.getElementById('reportBtn');
        if(adminBtn !== null)
          adminBtn.addEventListener('click', loadAdmin);
        
        if(reportBtn !== null)
          reportBtn.addEventListener('click', loadReport);
      }


      //Calls retry function of class bound to this.
      //Allows user to pick up where they left off after logging in again.
      this.retry.bind(this)();
    }
  }

  catch(error) {
    console.error('Error:', error);
  }
}

async function logout() {
  try {
    //Tell server to clear access cookie
    const response = await fetch(url + '/account/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    //Now reload page to initial login
    location.reload();
  } catch(error) {
    console.error('Error:', error);
  }
}

function addNavbar(username, admin, report) {
  //Creates navbar which displays username and has a logout button
  const html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">St Ronans</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li id="homeBtn" class="nav-item active">
          <a class="nav-link" href="">Home <span class="sr-only">(current)</span></a>
        </li>

        ${ admin? '<li id="adminBtn" class="nav-item"><a class="nav-link" href="#">Admin</a></li>' : '' }

        ${ report? '<li id="reportBtn" class="nav-item"><a class="nav-link" href="#">Report</a></li>' : '' }
      </ul>
      <span class="navbar-text mr-1">${username}</span>
      <button id="logout" class="btn btn-outline-secondary my-2 my-sm-0" type="btn">Logout</button>
    </div>
  </nav>`;
  document.body.insertAdjacentHTML('afterBegin', html);
  document.getElementById('logout').addEventListener('click', logout);

  if (admin) {
    document.getElementById('adminBtn').addEventListener('click', loadAdmin);
  }

  if(report) {
    document.getElementById('reportBtn').addEventListener('click', loadReport);
  }

  //Sets global navbar to true to ensure it is not added again.
  navbar = true;
}

function loadAdmin() {
  let adminPg = new Admin();
}

function loadReport() {
  let reportPh = new Report();
}

function clearError() {
  //If there is an error alert box, removes it.
  //This is to avoid multiple error alerts being added when the user retries.
  if (document.getElementById('errorAlert') !== null) {
    document.getElementById('errorAlert').outerHTML = '';
  }
}