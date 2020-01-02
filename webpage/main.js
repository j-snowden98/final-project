'use strict';
const url = 'http://192.168.0.4:8080';
let navbar = false;
let resTbl;


window.onload = function() {
  init();
};

document.addEventListener("keydown", event => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

function init() {
  resTbl = new ResTable();
}

function forceLogin() {
  const loginPg = `
    <form class="form-signin" id="signin">
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
      <div class="form-group">
        <input type="text" id="inputUser" class="form-control" placeholder="Username" required="" autofocus="">
        <input type="password" id="inputPassword" class="form-control" placeholder="Password">
      </div>
      <button id="btnLogin" type="button" class="btn btn-lg btn-primary btn-block">Sign in</button>
    </form>`;

  document.body.insertAdjacentHTML('beforeend', loginPg);
  document.getElementById('btnLogin').addEventListener('click', loginServer.bind(this));
}

async function loginServer() {
  let usr = document.getElementById('inputUser').value;
  let pass = document.getElementById('inputPassword').value;

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
    //Get report and admin permissions add to navbar!

    document.getElementById('signin').outerHTML = '';
    //Adds the navbar if it's not already there; user is now authorised
    if(!navbar)
      addNavbar();

    //(this) is the resident table. Retries initiating the table after authenticating user
    this.init.bind(this)();
  } catch (error) {
    console.error('Error:', error);
  }
}

function addNavbar() {
  const html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
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
  document.body.insertAdjacentHTML('afterBegin', html);
  navbar = true;
}


class ResTable {
  constructor() {
    this.timeout;
    this.init();
  }

  async init() {
    let json = await this.searchResidents();
    if(json.success) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="residents" class="ml-1 mr-1 str-component">
          <form class="form-inline my-2 my-lg-0">
            <input id="searchbar" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
          </form>
          <table class="table table-str table-striped table-dark str-component rounded">
            <thead>
              <tr>
                <th scope="col">Room</th>
                <th scope="col">Forename</th>
                <th scope="col">Surname</th>
              </tr>
            </thead>
            <tbody id="resTblBody">
          </table>
        </div>`);

      this.update(json.residents);
      this.resDiv = document.getElementById('residents');

      document.getElementById('searchbar').addEventListener('input', (event) => {
        this.searchChange();
      });
      if (!navbar)
        addNavbar();
    }
    else {
      //Binding this, to retry initiating the resident table when user is logged in.
      forceLogin.bind(this)();
    }
  }

  searchChange() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async function () {
      let results = await this.searchResidents(document.getElementById('searchbar').value);
      this.update(results.residents);
    }.bind(this), 500);
  }

  async searchResidents(filter = '') {
    try {
      const response = await fetch(url + `/api/resident/search?filter=${filter}`, {
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

  update(residents) {
    document.getElementById('resTblBody').innerHTML = '';
    for(let r of residents) {
      let newRes = new Resident(r);
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <th scope="row">${r.roomName}</th>
          <td>${r.forename}</td>
          <td>${r.surname}</td>
        </tr>`);
      document.getElementById('resTblBody').appendChild(row);
      row.addEventListener('click', newRes.openResMenu.bind(newRes));
    }
  }

  hide() {
    this.resDiv.setAttribute('style', 'display: none');
  }

  show() {
    this.resDiv.setAttribute('style', 'display: block');
  }
}

class Resident {
  constructor(resObject) {
    console.log(resObject);
    this.id = resObject.id;
    this.forename = resObject.forename;
    this.surname = resObject.surname;
    this.dietReq = resObject.dietReq;
    this.allergies = resObject.allergies;
    this.thickener = Boolean(resObject.thickener);
    this.roomName = resObject.roomName;
  }

  openResMenu() {
    resTbl.hide();
    console.log(this.id);
    document.body.insertAdjacentHTML('beforeend', `
      <div id="resOptions" class="ml-1 mr-1">
        <button id="backBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component" style="max-width: 30rem;">
          <div class="card-body">
            <h5 class="card-title">${this.forename + ' ' + this.surname}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${this.roomName}</h6>
            <p class="card-text">Dietary Requirements: ${this.dietReq === ''? 'None' : this.dietReq}</p>
            <p class="card-text">Allergies: ${this.allergies === ''? 'None' : this.allergies}</p>
            <p class="card-text">Thickener: ${!this.thickener? 'No' : 'Yes'}</p>
            <button id="btnContact" type="button" class="btn btn-secondary btn">Contact</button>
            <button id="btnFood" type="button" class="btn btn-secondary btn">Food & Fluid</button>
          </div>
        </div>
      </div>`);
    document.getElementById('backBtn').addEventListener('click', this.prevClick.bind(this));
    document.getElementById('btnContact').addEventListener('click', this.showContact.bind(this));
    document.getElementById('btnFood').addEventListener('click', this.showFoodFl.bind(this));
    this.resOptions = document.getElementById('resOptions');
  }

  prevClick(){
    this.resOptions.outerHTML = '';
    resTbl.show();
  }

  showContact() {
    this.resOptions.outerHTML = '';
    const ct = new ContactTable(this.id, this.openResMenu.bind(this));
  }

  showFoodFl() {

  }
}

class Table {
  constructor() {

  }

  update() {

  }

  show() {

  }

  hide() {

  }
}

class ContactTable {
  constructor(resID, goBack) {
      this.resID = resID;
      this.goBack = goBack;
      this.init();
  }

  async init() {
    try {
      let result = await this.searchContact();
      let contact = result.contact;
      console.log(contact);
      document.body.insertAdjacentHTML('beforeend', `
        <div id="contact" class="ml-1 mr-1">
          <button id="backBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
          <button id="addBtn" type="button" class="btn btn-lg btn-outline-primary">&#43;</button>
          <table class="table table-str table-striped table-dark str-component rounded">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Drink Given</th>
                <th scope="col">Description</th>
                <th scope="col">Username</th>
              </tr>
            </thead>
            <tbody id=contactTblBody>
            </tbody>
          </table>
        </div>`);
      document.getElementById('backBtn').addEventListener('click', this.remove.bind(this));
      document.getElementById('addBtn').addEventListener('click', this.openAdd.bind(this));
      this.tbl = document.getElementById('contact');
      this.update(contact);

    } catch (e) {
      forceLogin();
    }

  }

  async searchContact() {
    try {
      const response = await fetch(url + `/api/resident/contact/load?resID=${this.resID}`, {
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

  update(rows) {
    for(let r of rows) {
      let newContact = new Contact(r);
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.contactDate}</td>
          <td>${r.contactTime}</td>
          <td>${r.drinkGiven}</td>
          <td>${r.description}</td>
          <td>${r.username}</td>
        </tr>`);
      document.getElementById('contactTblBody').appendChild(row);
      //row.addEventListener('click', newContact.display.bind(newRes));
    }
  }

  openAdd() {
    this.hide();
    let add = new AddContact(this.resID, this.show.bind(this));
  }

  remove() {
    this.tbl.outerHTML = '';
    this.goBack();
  }

  hide() {
    this.tbl.setAttribute('style', 'display: none');
  }

  show() {
    this.tbl.setAttribute('style', 'display: block');
  }
}

class Contact {
  constructor() {
  }
}

class AddContact {
  constructor(resID, goBack) {
    this.resID = resID;
    this.goBack = goBack;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="addContact" class="card str-component ml-1 mr-1" style="max-width: 30rem;">
        <div class="card-body">
          <form>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="callBell">
              <label class="form-check-label" for="callBell">
                Call Bell
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="drinkGiven">
              <label class="form-check-label" for="drinkGiven">
                Drink Given
              </label>
            </div>
            <div class="form-group">
              <label for="desc">Care And Contact</label>
              <textarea class="form-control" id="desc" rows="3"></textarea>
            </div>
          </form>
          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger btn">Cancel</button>
            <button id="btnAccept" type="button" class="btn btn-success btn">Accept</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('addContact');

    this.callBell = document.getElementById('callBell');
    this.drinkGiven = document.getElementById('drinkGiven');
    this.desc = document.getElementById('desc');

    document.getElementById('btnCancel').addEventListener('click', this.remove.bind(this));
    document.getElementById('btnAccept').addEventListener('click', this.save.bind(this));
  }

  remove() {
    this.container.outerHTML = '';
    this.goBack();
  }

  async save() {
    try {
      let data = {
        resID: this.resID,
        callBell: this.callBell.checked,
        drinkGiven: this.drinkGiven.checked,
        description: this.desc.value
      }
      const response = await fetch(url + '/api/resident/contact/add', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
    } catch (error) {
      console.log(error);
    }
  }
}

class FoodFluidTable {
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
