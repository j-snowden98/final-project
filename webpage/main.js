'use strict';
const url = document.location.origin;
let navbar = false;
let resTbl;
let main;


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

      //Get report and admin permissions add to navbar!

      document.getElementById('signin').outerHTML = '';

      //Adds the navbar if it's not already there; user is now authorised
      //passes username from response to the navbar
      if(!navbar)
        addNavbar(json.username, json.admin);

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

function addNavbar(username, admin) {
  //Creates navbar which displays username and has a logout button
  const html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">FastTrack</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li id="homeBtn" class="nav-item active">
          <a class="nav-link" href="">Home <span class="sr-only">(current)</span></a>
        </li>

        ${ admin? '<li id="adminBtn" class="nav-item"><a class="nav-link" href="#">Admin</a></li>' : '' }
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

  //Sets global navbar to true to ensure it is not added again.
  navbar = true;
}

function loadAdmin() {
  let adminPg = new Admin();
}

function clearError() {
  //If there is an error alert box, removes it.
  //This is to avoid multiple error alerts being added when the user retries.
  if (document.getElementById('errorAlert') !== null) {
    document.getElementById('errorAlert').outerHTML = '';
  }
}



class ResTable {
  constructor() {
    this.timeout;
    this.hidden = false;
    this.init();
  }

  async init() {
    //Get response from search function making request to server. Sends empty filter parameter to retrieve all residents
    const response = await this.searchResidents();
    const status = await response.status;
    console.log(status);
    if(status === 200) {
      const json = await response.json();
      main.insertAdjacentHTML('beforeend', `
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
        addNavbar(json.username, json.admin);
    }
    else if(status === 401) {
      //Forcelogin uses retry from 'this' upon successful login.
      this.retry = this.init.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error.
      main.insertAdjacentHTML('beforeend', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
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
    //Get response from search function making request to server
    const response = await this.searchResidents(document.getElementById('searchbar').value);
    const status = await response.status;

    if(status === 200) {
      const json = await response.json();
      this.update(json.residents);
    }
    else if(status === 401) {
      //Forcelogin uses retry from 'this' upon successful login.
      this.hide();
      this.retry = this.doneTyping.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error
      this.resDiv.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
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
    //Setting its properties to that of resObject (which has been retrieved from DB)
    this.id = resObject.id;
    this.forename = resObject.forename;
    this.surname = resObject.surname;
    this.dietReq = resObject.dietReq;
    this.allergies = resObject.allergies;
    this.thickener = Boolean(resObject.thickener);
    this.diabetes = resObject.diabetes;
    this.dnr = Boolean(resObject.dnr);
    this.roomName = resObject.roomName;
  }

  openResMenu() {
    //Hide table of residents
    resTbl.hide();
    main.insertAdjacentHTML('beforeend', `
      <div id="resOptions" class="ml-1 mr-1">
        <button id="backBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component formcard">
          <div class="card-body">
            <h5 class="card-title">${this.forename + ' ' + this.surname}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${this.roomName}</h6>
            <p class="card-text">Dietary Requirements: ${this.dietReq === ''? 'None' : this.dietReq}</p>
            <p class="card-text">Allergies: ${this.allergies === ''? 'None' : this.allergies}</p>
            <p class="card-text">Thickener: ${!this.thickener? 'No' : 'Yes'}</p>
            <p class="card-text">Diabetes: ${this.diabetes === 0? 'No' : 'Type ' + this.diabetes}</p>
            ${this.dnr? '<p class="card-text dnr">Do Not Resuscitate</p>' : ''}
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
        main.insertAdjacentHTML('beforeend', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
        //Waits 1 second to notify user then returns to previous screen
        setTimeout(function(){
          clearError();
          this.goBack();
        }.bind(this), 1000);
        return;
      }

      const json = await response.json();
      const contact = json.contact;

      //Now add the contact table
      main.insertAdjacentHTML('beforeend', `
        <div id="contact" class="ml-1 mr-1">
          <button id="backBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
          <button id="addBtn" type="button" class="btn btn-lg btn-outline-primary">&#43;</button>
          <table class="table table-str table-striped table-dark str-component rounded">
            <thead>
              <tr>
                <th scope="col">${ window.screen.availWidth >= 600 ? 'Date' : '<i class="material-icons">calendar_today</i>' }</th>
                <th scope="col">${ window.screen.availWidth >= 600 ? 'Time' : '<i class="material-icons">access_time</i>' }</th>
                <th scope="col">${ window.screen.availWidth >= 600 ? 'Drink Given' : '<i class="material-icons">local_cafe</i>' }</th>
                <th scope="col">${ window.screen.availWidth >= 600 ? 'Descripion' : '<i class="material-icons">create</i>' }</th>
                <th scope="col">${ window.screen.availWidth >= 600 ? 'User' : '<i class="material-icons">account_circle</i>' }</th>
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
    this.mood = object.mood;
    this.username = object.username;
    this.goBack = goBack;
  }

  display() {
    //Display the details of this contact sheet entry
    const html = `
      <div id="dispContact" class="ml-1 mr-1">
        <button id="closeContact" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component formcard">
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
              <div class="form-group">
                <label for="mood">Mood</label>
                <textarea class="form-control" id="mood" rows="3" readonly>${this.mood}</textarea>
              </div>
            </form>
          </div>
        </div>
      </div>`
    main.insertAdjacentHTML('beforeend', html);
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
    this.added = added;
    main.insertAdjacentHTML('beforeend', `
      <div id="addContact" class="card str-component ml-1 mr-1 formcard">
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
              <textarea class="form-control" id="desc" rows="6" spellcheck="true"></textarea>
            </div>
            <div class="form-group">
              <label for="mood">Mood</label>
              <select class="form-control" id="moodSelect">
                <option>Calm</option>
                <option>Amused</option>
                <option>Cheerful</option>
                <option>Content</option>
                <option>Happy</option>
                <option>Peaceful</option>
                <option>Sad</option>
                <option>Stressed</option>
                <option>Restless</option>
                <option>Angry</option>
                <option>Grumpy</option>
                <option>Irritated</option>
                <option>Other</option>
              </select>
              <textarea class="form-control" id="mood" rows="3" spellcheck="true" placeholder="If 'Other', please specify."></textarea>
            </div>
          </form>
          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger btn">Cancel</button>
            <button id="btnSave" type="button" class="btn btn-success btn">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('addContact');

    this.callBell = document.getElementById('callBell');
    this.drinkGiven = document.getElementById('drinkGiven');
    this.desc = document.getElementById('desc');
    this.moodSelect = document.getElementById('moodSelect');
    this.mood = document.getElementById('mood')

    this.moodSelect.addEventListener('change', this.moodChange.bind(this));
    this.mood.setAttribute('readonly', 'true');

    document.getElementById('btnCancel').addEventListener('click', function() { this.remove(this.onCancel); }.bind(this));
    document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
  }

  moodChange() {
    if (this.moodSelect.value == "Other") {
      this.mood.removeAttribute('readonly');
    }
    else {
      this.mood.value = '';
      this.mood.setAttribute('readonly', 'true');
    }
  }

  remove(callback, json) {
    //Remove will call the given function with json as a parameter. This goes back to contact table and updates with new row from json parameter.
    this.container.outerHTML = '';
    callback(json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }

  validateInputs() {
    clearError();
    if (this.desc.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please fill in the Care and Contact section.</div>`);
    }
    else if (this.moodSelect.value === 'Other' && this.mood.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please fill in the Mood section.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to save the new entry to the server
        let data = {
          resID: this.resID,
          callBell: this.callBell.checked,
          drinkGiven: this.drinkGiven.checked,
          description: this.desc.value,
          mood: this.moodSelect.value === 'Other' ? this.mood.value : this.moodSelect.value
        }
        const response = await fetch(url + '/api/resident/contact/add', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.remove(this.added, json.new);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin uses retry from 'this' upon successful login.
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //Notify the user that they are not authorised. Go back to previous state
          window.alert(await response.text());
          this.onCancel();
        }
        else if (status === 500) {
          clearError();
          //Need to show form in case the user was forced to log in again which would have hidden it.
          this.show();

          //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data.
          //User can also click cancel at this point
          this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
          </div>`);
        }
      }
      catch(error) {
        console.error(error);
      }
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

class Admin {
  constructor() {
    main.innerHTML = '';
    main.insertAdjacentHTML('beforeend', `
      <div id="adminPg" class="ml-1 mr-1 str-component">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" id="users-tab" data-toggle="tab" href="#users" role="tab" aria-controls="users" aria-selected="true">Users</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="rooms-tab" data-toggle="tab" href="#rooms" role="tab" aria-controls="rooms" aria-selected="false">Rooms</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="residents-tab" data-toggle="tab" href="#residents" role="tab" aria-controls="residents" aria-selected="false">Residents</a>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="users" role="tabpanel" aria-labelledby="users-tab">
            <form class="form-inline my-2 my-lg-0">
              <input id="userSearch" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            </form>
            <table class="table table-str table-striped table-dark str-component rounded">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody id="usrTblBody">
            </table>
          </div>
          <div class="tab-pane fade" id="rooms" role="tabpanel" aria-labelledby="rooms-tab">
            <form class="form-inline my-2 my-lg-0">
              <input id="roomSearch" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            </form>
            <table class="table table-str table-striped table-dark str-component rounded">
              <thead>
                <tr>
                  <th scope="col">Room</th>
                  <th scope="col">Residents</th>
                </tr>
              </thead>
              <tbody id="roomTblBody">
            </table>
          </div>
          <div class="tab-pane fade" id="residents" role="tabpanel" aria-labelledby="residents-tab">
            <form class="form-inline my-2 my-lg-0">
              <input id="resSearch" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            </form>
            <table class="table table-str table-striped table-dark str-component rounded">
              <thead>
                <tr>
                  <th scope="col">Forename</th>
                  <th scope="col">Surname</th>
                  <th scope="col">Active</th>
                </tr>
              </thead>
              <tbody id="resTblBody">
            </table>
          </div>
        </div>
      </div>`);

    //Loads all of the tables for the admin page.
    this.usr = new AdminUsrTbl();
    this.room = new AdminRoomTbl();
    this.res = new AdminResTbl();

    //Show that the admin page is now selected
    document.getElementById('homeBtn').classList.remove('active');
    document.getElementById('adminBtn').classList.add('active');

    //Prevents the user clicking on the admin page while it is selected
    document.getElementById('adminBtn').removeEventListener('click', loadAdmin);
  }
}

class AdminUsrTbl {
  constructor() {
    this.hidden = false;
    this.timeout;
    this.adminPg = document.getElementById('adminPg');
    this.init();
  }

  async init() {
    const response = await this.searchUsers();
    const status = await response.status;
    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateUsers(json.users);

      document.getElementById('userSearch').addEventListener('input', (event) => {
        this.searchChange();
      });
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      resTbl.hide();
      this.retry = this.init.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error.
      document.getElementById('users').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  async searchUsers(filter = '') {
    try {
      //Send request to server to search for users with a given filter
      const response = await fetch(url + `/api/admin/user/search?filter=${filter}`, {
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

  async updateUsers(users) {
    //Clear table before adding search results
    document.getElementById('usrTblBody').innerHTML = '';

    //Iterate through array of results. For each create a row with new instance of class user so they can be clicked to show details
    for(let u of users) {
      let newUsr = new ManageUser(u);
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${u.username}</td>
          <td>${u.role}</td>
        </tr>`);
      document.getElementById('usrTblBody').appendChild(row);
      //Clicking on this new row will allow the user's details to be amended.
      //row.addEventListener('click', newRes.openResMenu.bind(newRes));
    }
  }

  searchChange() {
    //Reset timeout for retrieving users from server. Wait another 500ms, to avoid sending too many requests to the server.
    //Should allow time to finish typing for most people, without appearing unresponsive
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.doneTyping.bind(this), 500);
  }

  async doneTyping() {
    //If hidden (implying the user was forced to login on the last attempt) will show table again.
    if(this.hidden) {
      this.show();
    }
    //Get response from search function making request to server
    const response = await this.searchUsers(document.getElementById('userSearch').value);
    const status = await response.status;

    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateUsers(json.users);
    }
    else if(status === 401) {
      //Forcelogin calls doneTyping function again upon successful login.
      this.hide();
      this.retry = this.doneTyping.bind(this);
      forceLogin.bind(this)();
    }
    else if(status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error
      document.getElementById('users').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  show() {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');
  }

  hide() {
    this.hidden = true;
    this.adminPg.setAttribute('style', 'display: none');
  }
}

class AdminRoomTbl {
  constructor() {
    this.hidden = false;
    this.timeout;
    this.adminPg = document.getElementById('adminPg');
    this.init();
  }

  async init() {
    const response = await this.searchRooms();
    const status = await response.status;
    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateRooms(json.rooms);

      document.getElementById('roomSearch').addEventListener('input', (event) => {
        this.searchChange();
      });
    }
    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      this.hide();
      this.retry = this.init.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error.
      document.getElementById('rooms').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  async searchRooms(filter = '') {
    try {
      //Send request to server to search for rooms with a given filter
      const response = await fetch(url + `/api/admin/room/search?filter=${filter}`, {
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

  async updateRooms(rooms) {
    //Clear table before adding search results
    document.getElementById('roomTblBody').innerHTML = '';
    //Iterate through array of results. For each create a row with new instance of class ManageRoom
    for(let r of rooms) {
      let newRoom = new ManageRoom(r);
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.roomPrefix + r.roomNumber}</td>
          <td>${r.names}</td>
        </tr>`);
      document.getElementById('roomTblBody').appendChild(row);
      //Clicking on this new row will allow the room's details to be amended.
      //row.addEventListener('click', newRoom.openResMenu.bind(newRoom));
    }
  }

  searchChange() {
    //Reset timeout for retrieving rooms from server. Wait another 500ms, to avoid sending too many requests to the server.
    //Should allow time to finish typing for most people, without appearing unresponsive
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.doneTyping.bind(this), 500);
  }

  async doneTyping() {
    //If hidden (implying the user was forced to login on the last attempt) will show table again.
    if(this.hidden) {
      this.show();
    }
    //Get response from search function making request to server
    const response = await this.searchRooms(document.getElementById('roomSearch').value);
    const status = await response.status;

    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateRooms(json.rooms);
    }
    else if(status === 401) {
      //Forcelogin calls doneTyping function again upon successful login.
      this.hide();
      this.retry = this.doneTyping.bind(this);
      forceLogin.bind(this)();
    }
    else if(status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error
      document.getElementById('rooms').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  show() {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');
  }

  hide() {
    this.hidden = true;
    this.adminPg.setAttribute('style', 'display: none');
  }
}

class AdminResTbl {
  constructor() {
    this.hidden = false;
    this.timeout;
    this.adminPg = document.getElementById('adminPg');
    this.init();
  }

  async init() {
    const response = await this.searchResidents();
    const status = await response.status;
    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateResidents(json.residents);

      document.getElementById('resSearch').addEventListener('input', (event) => {
        this.searchChange();
      });
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      resTbl.hide();
      this.retry = this.init.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error.
      document.getElementById('resident').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  async searchResidents(filter = '') {
    try {
      //Send request to server to search for residents with a given filter
      const response = await fetch(url + `/api/admin/resident/search?filter=${filter}`, {
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

  async updateResidents(residents) {
    //Clear table before adding search results
    document.getElementById('resTblBody').innerHTML = '';
    //Iterate through array of results. For each create a row with new instance of class ManageResident so they can be clicked to show details
    for(let r of residents) {
      let newRes = new ManageResident(r);
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.forename}</td>
          <td>${r.surname}</td>
          <td>${r.active}</td>
        </tr>`);
      document.getElementById('resTblBody').appendChild(row);
      //Clicking on this new row will allow the resident's details to be amended.
      //row.addEventListener('click', newRes.openResMenu.bind(newRes));
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
    //Get response from search function making request to server
    const response = await this.searchResidents(document.getElementById('resSearch').value);
    const status = await response.status;

    if(status === 200) {
      clearError();
      const json = await response.json();
      this.updateResidents(json.residents);
    }

    else if(status === 401) {
      //Forcelogin uses retry from 'this' upon successful login.
      this.hide();
      this.retry = this.doneTyping.bind(this);
      forceLogin.bind(this)();
    }

    else if(status === 403) {
      window.alert(await response.text());
      location.reload();
    }

    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error
      document.getElementById('residents').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  show() {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');
  }

  hide() {
    this.hidden = true;
    this.adminPg.setAttribute('style', 'display: none');
  }
}

class ManageUser {
  constructor(userObj) {
    this.userID = userObj.id;
    this.username = userObj.username;
    this.role = userObj.role;
  }
}

class ManageRoom {
  constructor() {

  }
}

class ManageResident {
  constructor() {

  }
}
