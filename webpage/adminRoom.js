class ManageRoom {
  constructor(roomObj, onClose, currentSearch) {
    this.roomID = roomObj.id;
    this.roomPrefix = roomObj.roomPrefix;
    this.roomNumber = roomObj.roomNumber;
    this.onClose = onClose;
    //Retains the user's search for rooms for updating the list upon saving this room
    this.currentSearch = currentSearch;
    this.resChanged = false;
  }

  async openEdit() {
    const response = await this.loadRoomResidents();
    const status = await response.status;
    if(status === 200) {
      clearError();
      const json = await response.json();
      main.insertAdjacentHTML('beforeend', `
        <div id="manageRoom" class="card str-component ml-1 mr-1 formcard">
          <div class="card-body">
            <form id="roomEditForm">
              <div class="form-group">
                <label for="roomPref">Room Prefix</label>
                <input id="roomPref" type="text" class="form-control" value="${this.roomPrefix}">
              </div>

              <div class="form-group">
                <label for="roomNum">Room Number</label>
                <input id="roomNum" type="text" class="form-control" value="${this.roomNumber}">
              </div>

              <div class="form-group">
                <label for="roomResidents">Residents</label>
                <select multiple class="form-control" id="roomResidents">
                </select>
                <button id="btnAssign" type="button" class="btn btn-secondary mt-1">Assign Resident</button>
                <button id="btnUnassign" type="button" class="btn btn-danger mt-1">Unassign Resident</button>
              </div>
            </form>

            <div class="str-btn">
              <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
              <button id="btnSave" type="button" class="btn btn-success">Save</button>
            </div>
          </div>
        </div>
      `);
      this.container = document.getElementById('manageRoom');
      this.form = document.getElementById('roomEditForm');

      this.inputRoomPref = document.getElementById('roomPref');
      this.inputRoomNum = document.getElementById('roomNum');
      this.residentList = document.getElementById('roomResidents');

      document.getElementById('btnAssign').addEventListener('click', this.clickAssign.bind(this));
      document.getElementById('btnUnassign').addEventListener('click', this.clickUnassign.bind(this));

      this.updateResList(json.residents);
      document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
      document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      this.retry = this.openEdit.bind(this);
      forceLogin.bind(this)();
    }
    else if (status === 403) {
      window.alert(await response.text());
      location.reload();
    }
    else if (status === 500) {
      clearError();
      //Notify the user that there has been an error.
      container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
      </div>`);
    }
  }

  async loadRoomResidents() {
    try {
      const response = await fetch(url + `/api/admin/room/roomRes?roomID=${this.roomID}`, {
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

  updateResList(residents) {
    this.residentList.innerHTML = '';
    for(let r of residents) {
      this.residentList.insertAdjacentHTML('beforeend', `<option data-resid="${r.id}">${r.resName}</option>`);
    }
  }

  validateInputs() {
    clearError();
    if (this.inputRoomPref.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a prefix for the room.</div>`);
    }
    else if (this.inputRoomNum.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a room number.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to update room's information on the server
        let data = {
          roomID: this.roomID,
          roomPrefix: this.inputRoomPref.value,
          roomNumber: this.inputRoomNum.value,
          currentSearch: this.currentSearch
        }

        const response = await fetch(url + '/api/admin/room/edit', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.close(await json.rooms);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin uses retry from 'this' upon successful login.
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //Notify the user that they are not authorised. Reloads the page as they should not be on the admin page
          window.alert(await response.text());
          location.reload();
        }
        else if (status === 500) {
          clearError();
          //The form may have been hidden due to the user being forced to log in on the last attempt
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

  clickUnassign() {
    if (this.residentList.selectedIndex >= 0) {
      const resName = this.residentList.value;

      //Verfiy that the user wants to unassign the selected resident from the room
      if(confirm('Are you sure you want to unassign ' + resName + ' from this room?')) {
        this.unassignResident.bind(this)();
      }
    }
    else {
      window.alert('No resident has been selected');
    }

  }

  async unassignResident() {
    try {
      const resID = this.residentList.options[this.residentList.selectedIndex].dataset.resid;
      console.log(resID);
      const response = await fetch(url + '/api/admin/room/unassign', {
        method: 'POST',
        body: JSON.stringify({ roomID: this.roomID, resID: resID }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const status = await response.status;

      if(status === 200) {
        //If resident has sucessfully been unassigned, refresh the list of assigned residents with the array given in the response
        const json = await response.json();
        this.updateResList(await json.residents);
        this.resChanged = true;
      }
      else if(status === 401) {
        //Hide form before asking user to log in again
        this.hide();

        //Forcelogin will call this function again, another attempt will be made to unassign the resident
        this.retry = this.unassignResident.bind(this);
        forceLogin.bind(this)();
      }
      else if(status === 403) {
        //Notify the user that they are not authorised. Reloads the page as they should not be on the admin page
        window.alert(await response.text());
        location.reload();
      }
      else if (status === 500) {
        clearError();
        //The form may have been hidden due to the user being forced to log in on the last attempt
        this.show();

        //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data.
        this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
      }
    }
    catch(error) {
      console.error(error);
    }
  }

  clickAssign() {
    this.hide();
    let addNew = new AssignResident(this.roomID, this.show.bind(this));
  }

  close(json) {
    //Shows admin page again, sends updated list of rooms if changes have been made
    this.container.outerHTML = '';
    this.onClose(this.resChanged, json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show(residents) {
    this.container.setAttribute('style', 'display: flex');
    if(residents) {
      this.resChanged = true;
      this.updateResList(residents);
    }
  }
}

class AssignResident {
  constructor(roomID, onClose) {
    this.roomID = roomID;
    this.onClose = onClose;
    this.init();
  }

  async init() {
    try {
      //Send request to server to retrieve all residents not assigned to rooms
      const response = await fetch(url + `/api/admin/room/availRes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });

      const status = await response.status;
      if (status == 200) {
        const json = await response.json();
        main.insertAdjacentHTML('beforeend', `
          <div id="selectResident" class="str-component">
            <button id="btnBack" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
            <table class="table table-str table-striped table-dark str-component rounded">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                </tr>
              </thead>
              <tbody id="selectTblBody"></tbody>
            </table>
          </div>
        `);
        this.container = document.getElementById('selectResident');

        document.getElementById('btnBack').addEventListener('click', function() {
          this.close();
        }.bind(this));

        for(let r of await json.residents) {
          console.log(r);
          const row = document.createElement('tr');
          row.insertAdjacentHTML('beforeend', `
            <tr>
              <td>${r.resName}</td>
            </tr>`);
          document.getElementById('selectTblBody').appendChild(row);

          //Clicking on row will assign the corresponding resident to the room
          row.setAttribute('data-id', r.id);
          row.addEventListener('click', this.selected.bind(this));
        }
      }
      else if (status === 401) {
        //Forcelogin calls init function again upon successful login.
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

    } catch(error) {
      console.error('Error:', error);
    }

  }

  async selected(event) {
    try {
      const resID = parseInt(event.currentTarget.dataset.id);
      //Attempt to post data to the server
      let data = {
        roomID: this.roomID,
        resID: resID
      }
      const response = await fetch(url + '/api/admin/room/assign', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const status = await response.status;

      if(status === 200) {
        const json = await response.json();
        this.close(await json.residents);
      }
      else if(status === 401) {
        //Hide residents table before showing login form
        this.hide();

        //Forcelogin executes this function upon successful login.
        this.retry = this.save.bind(this);
        forceLogin.bind(this)();
      }
      else if(status === 403) {
        //Notify the user that they are not authorised. Reloads the page as they should not be on the admin page
        window.alert(await response.text());
        this.close();
      }
      else if (status === 500) {
        clearError();
        //The residents table may have been hidden due to the user being forced to log in on the last attempt
        this.show();

        //Notify user there has been an error. They may click the back button to return to the room form
        this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
      }
    }
    catch(error) {
      console.error(error);
    }
  }

  close(roomResidents) {
    this.container.outerHTML = '';
    this.onClose(roomResidents);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}

class AddRoom {
  constructor(onClose) {
    this.onClose = onClose;
    //Show the add room view
    main.insertAdjacentHTML('beforeend', `
      <div id="addRoom" class="card str-component ml-1 mr-1 formcard">
        <div class="card-body">
          <form id="roomEditForm">
            <div class="form-group">
              <label for="roomPref">Room Prefix</label>
              <input id="roomPref" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="roomNum">Room Number</label>
              <input id="roomNum" type="text" class="form-control">
            </div>
          </form>

          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
            <button id="btnSave" type="button" class="btn btn-success">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('addRoom');
    this.inputRoomPref = document.getElementById('roomPref');
    this.inputRoomNum = document.getElementById('roomNum');

    document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
    document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
  }

  validateInputs() {
    clearError();
    if (this.inputRoomPref.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a prefix for the room.</div>`);
    }
    else if (this.inputRoomNum.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a room number.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to save details of the new room to the server
        let data = {
          roomPrefix: this.inputRoomPref.value,
          roomNumber: this.inputRoomNum.value,
        }

        const response = await fetch(url + '/api/admin/room/add', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.close(await json.rooms);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin attempts to call this save function again upon successful login
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //Notify the user that they are not authorised. Reloads the page as they should not be on the admin page
          window.alert(await response.text());
          location.reload();
        }
        else if (status === 500) {
          clearError();
          //The form may have been hidden due to the user being forced to log in on the last attempt
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

  close(json) {
    //Returns to room table and passes an updated list of rooms if one has been added
    this.container.outerHTML = '';
    this.onClose(false, json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}
