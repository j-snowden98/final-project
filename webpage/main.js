'use strict';
const url = 'http://192.168.0.7:8080';
let navbar = false;
let resTbl;


window.onload = function() {
  //Calls init function when site is loaded/refreshed
  init();
};

document.addEventListener("keydown", event => {
  //When forms are being used, prevents enter from submitting and reloading page.
  if(event.keyCode === 13) {
    event.preventDefault();
  }
});

function init() {
  //This code is called when the page is loaded. Creates a table of residents and loads from it.
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

  document.body.insertAdjacentHTML('beforeend', loginPg);
  document.getElementById('btnLogin').addEventListener('click', loginServer.bind(this));
}

async function loginServer() {
  //This function will send a login request to the server with entered credentials
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
    //Check status of response to determine what to do next
    const status = await response.status;
    if(status === 401) {
      //Alert the user that the credentials they entered were incorrect
      document.getElementById('signin').insertAdjacentHTML('afterBegin', `
      <div class="alert alert-danger" role="alert">
        ${await response.text()}
      </div>`);
    }
    else if (status === 500) {
      //Alert user of an error with the server
      document.getElementById('signin').insertAdjacentHTML('afterBegin', `<div class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
    else {
      const json = await response.json();

      //Get report and admin permissions add to navbar!

      document.getElementById('signin').outerHTML = '';

      //Adds the navbar if it's not already there; user is now authorised
      //passes username from response to the navbar
      if(!navbar)
        addNavbar(json.username);

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
    const response = await fetch(url + '/user/logout', {
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

function addNavbar(username) {
  //Creates navbar which displays username and has a logout button
  const html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">FastTrack</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a class="nav-link" href="">Home <span class="sr-only">(current)</span></a>
        </li>
      </ul>
      <span class="navbar-text mr-1">${username}</span>
      <button id="logout" class="btn btn-outline-secondary my-2 my-sm-0" type="btn">Logout</button>
    </div>
  </nav>`;
  document.body.insertAdjacentHTML('afterBegin', html);
  document.getElementById('logout').addEventListener('click', logout);
  //Sets global navbar to true to ensure it is not added again.
  navbar = true;
}


class ResTable {
  constructor() {
    this.timeout;
    this.hidden = false;
    this.init();
  }

  async init() {
    //Get response from search funciton making request to server. Sends empty filter to retrieve all residents
    const response = await this.searchResidents();
    const json = await response.json();
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

      //Passes username from response to navbar
      if(!navbar)
        addNavbar(json.username);
    }
    else {
      //Request is not successful. Inspect status code to determine whether token has expired or there is an error with the server instead.
      const status = response.status;
      console.log(status);
      if(status === 401) {
        //Forcelogin uses retry from 'this' upon successful login.
        this.retry = this.init.bind(this);
        forceLogin.bind(this)();
      }
      if(status === 500) {
        //Notify the user that there has been an error.
        document.body.insertAdjacentHTML('afterBegin', `<div class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
      }
    }
  }

  searchChange() {
    //Reset timeout for retrieving residents from server. Wait another 500ms, to avoid sending too many requests to the server.
    //Should allow time to finish typing for most people, without appearing unresponsive
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.doneTyping.bind(this), 500);
  }

  async doneTyping() {
    //If hidden (implying the user was forced to login on the last attempt) will show table again.
    if(this.hidden) {
      this.show();
    }
    //Get response from search funciton making request to server
    const response = await this.searchResidents(document.getElementById('searchbar').value);
    const json = await response.json();
    if(json.success){
      this.update(json.residents);
    }
    else {
      //Request is not successful. Inspect status code to determine whether token has expired or there is an error with the server instead.
      const status = response.status;
      if(status === 401) {
        //Must hide table before displaying login form
        this.hide();
        //Forcelogin uses retry from 'this' upon successful login.
        this.retry = this.doneTyping.bind(this);
        forceLogin.bind(this)();
      }

      if(status === 500) {
        //Notify the user that there has been an error
        this.resDiv.insertAdjacentHTML('afterBegin', `<div class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
      }
    }
  }

  async searchResidents(filter = '') {
    try {
      //Send request to server to search for residents with a given filter
      const response = await fetch(url + `/api/resident/search?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      //Returns whole response object, allowing caller to inspect status code to respond accordingly
      return response;

    } catch(error) {
      console.error('Error:', error);
    }
  }

  update(residents) {
    //Clear table before adding search results
    document.getElementById('resTblBody').innerHTML = '';
    //Iterate through array of results. For each create a row with new instance of class resident
    //so they can be clicked to show details
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
      //Clicking on this new row will display the menu for this instance of class resident.
      row.addEventListener('click', newRes.openResMenu.bind(newRes));
    }
  }

  hide() {
    this.resDiv.setAttribute('style', 'display: none');
    this.hidden = true;
  }

  show() {
    this.resDiv.setAttribute('style', 'display: block');
    this.hidden = false;
  }
}

class Resident {
  constructor(resObject) {
    console.log(resObject);
    //Setting its properties to that of resObject (which has been retrieved from DB)
    this.id = resObject.id;
    this.forename = resObject.forename;
    this.surname = resObject.surname;
    this.dietReq = resObject.dietReq;
    this.allergies = resObject.allergies;
    this.thickener = Boolean(resObject.thickener);
    this.roomName = resObject.roomName;
  }

  openResMenu() {
    //Hide table of residents
    resTbl.hide();
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

    //Open contact table for this resident when button is clicked
    document.getElementById('btnContact').addEventListener('click', this.showContact.bind(this));

    //Open food & fluid table for this resident when button is clicked
    document.getElementById('btnFood').addEventListener('click', this.showFoodFl.bind(this));
    this.resOptions = document.getElementById('resOptions');
  }

  prevClick(){
    //Clears resident menu, goes back to table of residents.
    this.resOptions.outerHTML = '';
    resTbl.show();
  }

  showContact() {
    //Opens contact table for this resident
    this.resOptions.outerHTML = '';
    const ct = new ContactTable(this.id, this.openResMenu.bind(this));
  }

  showFoodFl() {

  }
}

class ContactTable {
  constructor(resID, goBack) {
      this.resID = resID;
      this.goBack = goBack;
      this.init();
  }

  async init() {
    //First retrieve contact for the resident from the last 24hrs
    try {
      const response = await fetch(url + `/api/resident/contact/load?resID=${this.resID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      const status = await response.status;
      console.log(status);
      //Inspect status code to determine whether token has expired, which would return a 401
      if(status === 401) {
        //Forcelogin uses retry from 'this' upon successful login.
        this.retry = this.init.bind(this);
        forceLogin.bind(this)();
        //return to avoid executing the rest of the function in this case
        return;
      }
      else if(status === 403) {
        //Notify the user that they are not authorised. Go back to previous state
        window.alert(await response.text());
        this.goBack();
        return;
      }
      else if(status === 500) {
        //Notify the user that there has been an error
        document.body.insertAdjacentHTML('beforeend', `<div id="reqFailedAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
        //Waits 1 second to notify user then returns to previous screen
        setTimeout(function(){
          document.getElementById('reqFailedAlert').outerHTML = '';
          this.goBack();
        }.bind(this), 1000);
        return;
      }

      const json = await response.json();
      const contact = json.contact;

      //Now add the contact table
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

      //Returns to previous screen
      document.getElementById('backBtn').addEventListener('click', this.remove.bind(this));

      //Allows new contact sheet entry to be added
      document.getElementById('addBtn').addEventListener('click', this.openAdd.bind(this));

      //Fill in the contact table with retrieved data
      this.tbl = document.getElementById('contact');
      this.update(contact);

    } catch(error) {
      console.error('Error:', error);
    }
  }

  update(rows) {
    //Loop through data to add a row in the table for each
    for(let r of rows) {
      let newContact = new Contact(r, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.contactDate}</td>
          <td>${r.contactTime}</td>
          <td>${Boolean(r.drinkGiven)? 'Yes' : 'No'}</td>
          <td>${r.description}</td>
          <td>${r.username}</td>
        </tr>`);
      //Display information for this contact sheet entry when its respective row is clicked
      document.getElementById('contactTblBody').appendChild(row);
      row.addEventListener('click', function() {
        this.hide();
        newContact.display.bind(newContact)();
      }.bind(this));
    }
  }

  openAdd() {
    //Hides contact sheet table and displays the form for the user to enter the necessary information
    this.hide();
    let add = new AddContact(this.resID, this.show.bind(this), this.showNew.bind(this));
  }

  remove() {
    //Completely removes contact table and goes back to previous screen
    this.tbl.outerHTML = '';
    this.goBack();
  }

  hide() {
    this.tbl.setAttribute('style', 'display: none');
  }

  show() {
    this.tbl.setAttribute('style', 'display: block');
  }

  showNew(newEntry) {
    //After adding a new entry, updates the table with it at the top
    this.show();
    let newContact = new Contact(newEntry, this.show.bind(this));
    let row = document.createElement('tr');
    row.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${newEntry.contactDate}</td>
        <td>${newEntry.contactTime}</td>
        <td>${Boolean(newEntry.drinkGiven)? 'Yes' : 'No'}</td>
        <td>${newEntry.description}</td>
        <td>${newEntry.username}</td>
      </tr>`);
    //Allows new row to be clicked to view information in more detail
    document.getElementById('contactTblBody').prepend(row);
    row.addEventListener('click', function() {
      this.hide();
      newContact.display.bind(newContact)();
    }.bind(this));
  }
}

class Contact {
  constructor(object, goBack) {
    //Sets attributes to the same as contact entry object (from DB)
    this.contactDate = object.contactDate;
    this.contactTime = object.contactTime;
    this.callBell = object.callBell;
    this.drinkGiven = object.drinkGiven;
    this.description = object.description;
    this.username = object.username;
    this.goBack = goBack;
  }

  display() {
    //Display the details of this contact sheet entry
    const html = `
      <div id="dispContact" class="ml-1 mr-1">
        <button id="closeContact" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component" style="max-width: 30rem;">
          <div class="card-body">
            <form>
              <label>Time entered: ${this.contactDate + ' ' + this.contactTime}</label>
              <label>Entered by: ${this.username}</label>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" ${Boolean(this.callBell) ? 'checked="true"' : ''} id="callBell" disabled>
                <label class="form-check-label" for="callBell">Call Bell</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" ${Boolean(this.drinkGiven) ? 'checked="true"' : ''} id="drinkGiven" disabled>
                <label class="form-check-label" for="drinkGiven">
                  Drink Given
                </label>
              </div>
              <div class="form-group">
                <label for="desc">Care And Contact</label>
                <textarea class="form-control" id="desc" rows="6" readonly>${this.description}</textarea>
              </div>
            </form>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', html);
    this.container = document.getElementById('dispContact');
    //Back button goes back to contact table
    document.getElementById('closeContact').addEventListener('click', this.close.bind(this));
  }

  close() {
    //Clear this screen and go back to previous screen
    this.container.outerHTML = '';
    this.goBack();
  }
}

class AddContact {
  constructor(resID, onCancel, added) {
    //resID given so the entry can be saved to the residents ID
    //onCancel function allows user to return to previous screen and not save changes
    //added function to be called once entry has been successfully saved
    this.resID = resID;
    this.onCancel = onCancel;
    this.added = added
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
              <textarea class="form-control" id="desc" rows="6"></textarea>
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

    document.getElementById('btnCancel').addEventListener('click', function() { this.remove(this.onCancel); }.bind(this));
    document.getElementById('btnAccept').addEventListener('click', this.save.bind(this));
  }

  remove(callback, json) {
    //Remove will call the given function with json as a parameter. This goes back to contact table and updates with new row from json parameter.
    this.container.outerHTML = '';
    callback(json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  async save() {
    try {
      //Attempt to save the new entry to the server
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

      console.log(json);
      if(json.success) {
        //Show new entry in contact table if successfully saved
        this.remove(this.added, json.new);
      }
      else {
        //Request is not successful. Inspect status code to determine whether token has expired or there is an error with the server instead.
        const status = response.status;
        if(status === 401) {
          //Hide form before showing login form
          this.hide();
          //Forcelogin uses retry from 'this' upon successful login.
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //notify user that they are not authorised. Go back to last state
          window.alert(json.message);
          this.onCancel();
          return;
        }
        else if(status === 500) {
          //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data.
          //User can also click cancel at this point
          this.container.insertAdjacentHTML('afterBegin', `<div id="reqFailedAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
          </div>`);
        }
      }
    } catch(error) {
      console.error(error);
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
