class Admin {
  constructor() {
    main.innerHTML = '';
    //Insert the HTML for the admin page, consisting of separate tabs for users, residents and rooms.
    //Each respective tab has its own table which will be populated later by their respective classes
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
            <form class="form-inline my-2 my-lg-0 str-component">
              <input id="userSearch" class="form-control mr-1 adminSearch" type="search" placeholder="Search" aria-label="Search">
              <button id="addUserBtn" title="Add new user" type="button" class="btn btn-outline-primary">&#43;</button>
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
            <form class="form-inline my-2 my-lg-0 str-component">
              <input id="roomSearch" class="form-control mr-1 adminSearch" type="search" placeholder="Search" aria-label="Search">
              <button id="addRoomBtn" title="Add new room" type="button" class="btn btn-outline-primary">&#43;</button>
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
            <form class="form-inline my-2 my-lg-0 str-component">
              <input id="resSearch" class="form-control mr-1 adminSearch" type="search" placeholder="Search" aria-label="Search">
              <button id="addResBtn" title="Add new resident" type="button" class="btn btn-outline-primary">&#43;</button>
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


      document.getElementById('addUserBtn').addEventListener('click', function() {
        //Loads form to add new user. Passes the show function so table is reloaded when a user is successfully saved.
        this.hide();
        const addNew = new AddUser(this.show.bind(this));
      }.bind(this));
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      resTbl.hide();
      this.retry = this.init.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 403) {
      //Notify the user that they do not have the admin permission. Return to non admin view by reloading.
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      //Clear the current error if this is another failed attempt to avoid duplicate errors
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
      let newUsr = new ManageUser(u, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${u.username}</td>
          <td>${u.role}</td>
        </tr>`);
      document.getElementById('usrTblBody').appendChild(row);
      //Clicking on this new row will allow the user's details to be amended.
      row.addEventListener('click', function() {
        this.hide();
        newUsr.openEdit.bind(newUsr)();
        console.log(newUsr);
      }.bind(this));
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
      //Remove error message from a previously failed attempt
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
      //Clear the current error if this is another failed attempt to avoid duplicate errors
      clearError();
      //Notify the user that there has been an error
      document.getElementById('users').insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  show(refreshUsers) {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');
    if (refreshUsers) {
      this.updateUsers(refreshUsers);
    }
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
      //Remove the error message if there is one
      clearError();

      //Populate the rooms table with retrieved data
      const json = await response.json();
      this.updateRooms(json.rooms);

      document.getElementById('roomSearch').addEventListener('input', (event) => {
        this.searchChange();
      });

      document.getElementById('addRoomBtn').addEventListener('click', function() {
        //Loads form to add new room. Passes the show function so room table is reloaded when a room is successfully added
        this.hide();
        const addNew = new AddRoom(this.show.bind(this));
      }.bind(this));
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
      let newRoom = new ManageRoom(r, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.roomPrefix + r.roomNumber}</td>
          <td>${r.names}</td>
        </tr>`);
      document.getElementById('roomTblBody').appendChild(row);
      //Clicking on this new row will allow the room's details to be amended.
      row.addEventListener('click', function() {
        this.hide();
        newRoom.openEdit.bind(newRoom)();
      }.bind(this));
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

  show(resChanged, refreshRooms) {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');

    //If the function has been passed an updated list of rooms, it will use this to update the table
    if (refreshRooms) {
      this.updateRooms(refreshRooms);
    }
    //Otherwise, if the residents were assigned or unassigned to the previously edited room. It will search the rooms again.
    else if(resChanged) {
      this.doneTyping();
    }

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

      document.getElementById('addResBtn').addEventListener('click', function() {
        //Loads form to add new resident when add button is clicked. Passes the show function so table is reloaded when a resident is successfully saved.
        this.hide();
        const addNew = new AddResident(this.show.bind(this));
      }.bind(this));
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
      let newRes = new ManageResident(r, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.forename}</td>
          <td>${r.surname}</td>
          <td>${ r.active? 'Yes' : 'No' }</td>
        </tr>`);
      document.getElementById('resTblBody').appendChild(row);
      //Clicking on this new row will allow the resident's details to be amended.
      row.addEventListener('click', function() {
        this.hide();
        newRes.openEdit.bind(newRes)();
      }.bind(this));
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

  show(refreshResidents) {
    this.hidden = false;
    this.adminPg.setAttribute('style', 'display: block');
    if (refreshResidents) {
      this.updateResidents(refreshResidents);
    }
  }

  hide() {
    this.hidden = true;
    this.adminPg.setAttribute('style', 'display: none');
  }
}
