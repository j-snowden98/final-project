class ManageUser {
  constructor(userObj, onClose) {
    this.userID = userObj.id;
    this.username = userObj.username;
    this.role = userObj.role;
    this.onClose = onClose;
  }

  async openEdit() {
    const response = await this.loadUserPermissions();
    const status = await response.status;
    console.log('openEdit');
    console.log(response);
    if(status === 200) {
      clearError();
      const json = await response.json();
      main.insertAdjacentHTML('beforeend', `
        <div id="manageUser" class="card str-component ml-1 mr-1 formcard">
          <div class="card-body">
            <form id="userEditForm">
              <div class="form-group">
                <label for="username">Username</label>
                <input id="username" type="text" class="form-control" value="${this.username}">
              </div>

              <div class="form-group">
                <label for="role">Role</label>
                <input id="role" type="text" class="form-control" value="${this.role}">
              </div>

              <div class="form-group">
                <button id="btnPass" type="button" class="btn btn-secondary">Reset Password</button>
              </div>

            </form>

            <div class="str-btn">
              <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
              <button id="btnSave" type="button" class="btn btn-success">Save</button>
            </div>
          </div>
        </div>
      `);
      this.container = document.getElementById('manageUser');
      this.form = document.getElementById('userEditForm');
      document.getElementById('btnPass').addEventListener('click', function() {
        this.hide();
        const resetPass = new ResetPassword(this.userID, this.show.bind(this));
      }.bind(this));
      this.inputUsername = document.getElementById('username');
      this.inputRole = document.getElementById('role');

      document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
      document.getElementById('btnSave').addEventListener('click', this.save.bind(this));


      for(let p of json.permissions) {
        this.form.insertAdjacentHTML('beforeend', `
        <div class="form-check">
          <input class="form-check-input permissionCheck" type="checkbox" ${ p.userID === null? '' : 'checked' } value="" id="p${p.type}" data-pid="${p.id}">
          <label class="form-check-label" for="p${p.type}">
            ${p.name}
          </label>
        </div>`);
      }
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      this.hide();
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

  async loadUserPermissions() {
    try {
      //Send request to server to search for users with a given filter
      const response = await fetch(url + `/api/admin/user/permissions?userID=${this.userID}`, {
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

  validateInputs() {
    clearError();
    if (this.inputUsername.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a username.</div>`);
    }
    else if (this.inputRole.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the user's role.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        const pmsnChecks = document.getElementsByClassName('permissionCheck');
        const grantedIds = [];

        for(let p of pmsnChecks) {
          if(p.checked)
            grantedIds.push(p.dataset.pid);
        }
        console.log(grantedIds);

        //Attempt to save the new entry to the server
        let data = {
          userID: this.userID,
          username: this.inputUsername.value,
          role: this.inputRole.value,
          permissions: grantedIds
        }

        const response = await fetch(url + '/api/admin/user/edit', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.close(await json.users);
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
          location.reload();
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

  close(json) {
    //Remove will call the given function with json as a parameter. This goes back to contact table and updates with new row from json parameter.
    this.container.outerHTML = '';
    this.onClose(json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}

class ResetPassword {
  constructor(userID, onClose) {
    this.userID = userID;
    this.onClose = onClose;
    main.insertAdjacentHTML('beforeend', `
      <div id="passReset" class="card str-component ml-1 mr-1 formcard">
        <div class="card-body">
          <form>
            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" type="password" class="form-control">
            </div>

            <div class="form-group">
              <label for="verPassword">Verify Password</label>
              <input id="verPassword" type="password" class="form-control">
            </div>
          </form>
          <div class="str-btn">
            <button id="btnCancelPass" type="button" class="btn btn-danger btn">Cancel</button>
            <button id="btnSavePass" type="button" class="btn btn-success btn">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('passReset');
    this.pass = document.getElementById('password');
    this.verPass = document.getElementById('verPassword');

    document.getElementById('btnCancelPass').addEventListener('click', this.close.bind(this));
    document.getElementById('btnSavePass').addEventListener('click', this.save.bind(this));
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to post data to the server
        let data = {
          userID: this.userID,
          password: this.pass.value
        }
        const response = await fetch(url + '/api/admin/user/password', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          this.close();
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
          this.close();
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

  validateInputs() {
    clearError();
    if (this.pass.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a password.</div>`);
    }
    else if (this.verPass === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please type the password again.</div>`);
    }
    else if (this.pass.value !== this.verPass.value) {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">The passwords do not match.</div>`);
    }
    else {
      return true;
    }
  }

  close() {
    this.container.outerHTML = '';
    this.onClose();
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}

class AddUser {
  constructor(onClose) {
    this.onClose = onClose;
    this.openAdd();
  }

  async openAdd() {
    const response = await this.loadUserPermissions();
    const status = await response.status;
    console.log(response);
    if(status === 200) {
      clearError();
      const json = await response.json();
      main.insertAdjacentHTML('beforeend', `
        <div id="registerUser" class="card str-component ml-1 mr-1 formcard">
          <div class="card-body">
            <form id="registerUserForm">
              <div class="form-group">
                <label for="username">Username</label>
                <input id="username" type="text" class="form-control">
              </div>

              <div class="form-group">
                <label for="role">Role</label>
                <input id="role" type="text" class="form-control">
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input id="password" type="password" class="form-control">
              </div>

              <div class="form-group">
                <label for="verPassword">Verify Password</label>
                <input id="verPassword" type="password" class="form-control">
              </div>
            </form>

            <div class="str-btn">
              <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
              <button id="btnSave" type="button" class="btn btn-success">Save</button>
            </div>
          </div>
        </div>
      `);
      this.container = document.getElementById('registerUser');
      this.form = document.getElementById('registerUserForm');

      this.inputUsername = document.getElementById('username');
      this.inputRole = document.getElementById('role');
      this.inputPass = document.getElementById('password');
      this.inputVerPass = document.getElementById('verPassword');

      document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
      document.getElementById('btnSave').addEventListener('click', this.save.bind(this));


      for(let p of json.permissions) {
        this.form.insertAdjacentHTML('beforeend', `
        <div class="form-check">
          <input class="form-check-input permissionCheck" type="checkbox" ${ p.userID === null? '' : 'checked' } value="" id="p${p.type}" data-pid="${p.id}">
          <label class="form-check-label" for="p${p.type}">
            ${p.name}
          </label>
        </div>`);
      }
    }

    else if (status === 401) {
      //Forcelogin calls init function again upon successful login.
      this.hide();
      this.retry = this.openAdd.bind(this);
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

  async loadUserPermissions() {
    try {
      //Get user permissions from server. Does not send a userID, therefore all permissions will come back with null for userID.
      //The purpose is to load all of the permissions available on the system
      const response = await fetch(url + `/api/admin/user/permissions`, {
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

  validateInputs() {
    clearError();
    if (this.inputUsername.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a username.</div>`);
    }
    else if (this.inputRole.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the user's role.</div>`);
    }
    else if (this.inputPass.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter a password.</div>`);
    }
    else if (this.inputVerPass.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please type the password again.</div>`);
    }
    else if (this.inputPass.value !== this.inputVerPass.value) {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">The passwords do not match.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    //Will not save the data unless all fields are successfully validated
    if (this.validateInputs()) {
      try {
        //Find which permissions have been selected, using the permission id stored in the data attribute of the respective checkboxes
        const pmsnChecks = document.getElementsByClassName('permissionCheck');
        const grantedIds = [];

        for(let p of pmsnChecks) {
          if(p.checked)
            grantedIds.push(p.dataset.pid);
        }
        console.log(grantedIds);

        //Create a JSON object with all data fields to be stored
        let data = {
          username: this.inputUsername.value,
          role: this.inputRole.value,
          password: this.inputPass.value,
          permissions: grantedIds
        }

        //Attempt to post the data to the server
        const response = await fetch(url + '/api/admin/user/register', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.close(await json.users);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin calls save again upon successful login.
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //Notify the user that they do not have admin permissions. Page is reloaded to display only what the user is authorised to do on the system
          window.alert(await response.text());
          location.reload();
        }
        else if (status === 500) {
          clearError();
          //Need to show form in case the user was forced to log in again which would have hidden it
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
    //Remove will call the given function with json as a parameter. This goes back to contact table and updates with new row from json parameter.
    this.container.outerHTML = '';
    this.onClose(json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}
