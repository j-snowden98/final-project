class ManageResident {
  constructor(resObj, onClose, currentSearch) {
    this.resID = resObj.id;
    this.forename = resObj.forename;
    this.surname = resObj.surname;
    this.birthDate = resObj.dob;
    this.mvHandling = resObj.mvHandling;
    this.dietReq = resObj.dietReq;
    this.allergies = resObj.allergies;
    this.thickener = resObj.thickener;
    this.diabetes = resObj.diabetes;
    this.dnr = resObj.dnr;

    this.onClose = onClose;
    //Retains user's search for residents for updating the list upon saving this resident
    this.currentSearch = currentSearch;
  }

  async openEdit() {
    main.insertAdjacentHTML('beforeend', `
      <div id="manageResident" class="card str-component ml-1 mr-1 formcard">
        <div class="card-body">
          <form id="resEditForm">
            <div class="form-group">
              <label for="forename">Forename</label>
              <input id="forename" type="text" class="form-control" value="${this.forename}">
            </div>

            <div class="form-group">
              <label for="surname">Surname</label>
              <input id="surname" type="text" class="form-control" value="${this.surname}">
            </div>

            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input id="dob" type="date" class="form-control" value="${this.birthDate}">
            </div>

            <div class="form-group">
              <label for="mvHandling">Moving & Handling</label>
              <input id="mvHandling" type="text" class="form-control" value="${this.mvHandling}">
            </div>

            <div class="form-group">
              <label for="dietReq">Dietary Requirements</label>
              <input id="dietReq" type="text" class="form-control" value="${this.dietReq}">
            </div>

            <div class="form-group">
              <label for="allergies">Allergies</label>
              <input id="allergies" type="text" class="form-control" value="${this.allergies}">
            </div>

            <div class="form-group">
              <label for="diabetes">Diabetes</label>
              <select class="form-control" id="diabetes">
                <option value="0">None</option>
                <option value="1">Type 1</option>
                <option value="2">Type 2</option>
              </select>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" ${ Boolean(this.thickener)? 'checked' : '' } id="thickener">
              <label class="form-check-label" for="thickener">Thickener</label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" ${ Boolean(this.dnr)? 'checked' : '' } id="dnr">
              <label class="form-check-label" for="dnr">Do Not Resuscitate</label>
            </div>
          </form>

          <div class="form-group">
            <button id="btnDeactivate" type="button" class="btn btn-danger ml-1">Deactivate Resident</button>
          </div>

          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
            <button id="btnSave" type="button" class="btn btn-success">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('manageResident');
    this.form = document.getElementById('resEditForm');

    this.inputForename = document.getElementById('forename');
    this.inputSurname = document.getElementById('surname');
    this.inputBirth = document.getElementById('dob');
    this.inputMH = document.getElementById('mvHandling');
    this.inputDiet = document.getElementById('dietReq');
    this.inputAllergies = document.getElementById('allergies');
    this.selectDiabetes = document.getElementById('diabetes');
    this.inputThickener = document.getElementById('thickener');
    this.inputDnr = document.getElementById('dnr');

    //Sets the selected option to the resident's diabetes type, 0 if none
    this.selectDiabetes.value = this.diabetes;

    document.getElementById('btnDeactivate').addEventListener('click', this.clickDeactivate.bind(this));
    document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
    document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
  }

  validateInputs() {
    clearError();
    //Ensure that the forename is not left blank
    if (this.inputForename.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the resident's Forename</div>`);
    }
    //Ensure that the surname is not left blank
    else if (this.inputSurname.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the resident's Surname</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to update the residents's details in the server
        let data = {
          resID: this.resID,
          forename: this.inputForename.value,
          surname: this.inputSurname.value,
          birthDate: this.inputBirth.value,
          mvHandling: this.inputMH.value,
          dietReq: this.inputDiet.value,
          allergies: this.inputAllergies.value,
          thickener: this.inputThickener.checked,
          diabetes: parseInt(this.selectDiabetes.value),
          dnr: this.inputDnr.checked,
          currentSearch: this.currentSearch
        }

        const response = await fetch(url + '/api/admin/resident/edit', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          //Close the form, send updated list of residents back to admin page
          this.close(await json.residents);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin attemps to save the data again upon successful login.
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
          //The view may have been hidden due to the user being forced to log in on the last attempt
          this.show();

          //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data
          this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
          </div>`);
        }
      }
      catch(error) {
        console.error(error);
      }
    }
  }

  clickDeactivate() {
    //Ask the user if they are sure about deactivating a resident. Allows them to cancel if they clicked the button by mistake
    if(confirm('Are you sure you want to deactivate this resident?')) {
      this.deactivate();
    }
  }

  async deactivate() {
    try {
      const response = await fetch(url + '/api/admin/resident/deactivate', {
        method: 'POST',
        body: JSON.stringify({ resID: this.resID }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const status = await response.status;

      if(status === 200) {
        //If resident has been deactivated, return to admin page and refresh users
        const json = await response.json();
        this.close(await json.residents);
      }
      else if(status === 401) {
        //Hide form before asking user to log in again
        this.hide();

        //Forcelogin then calls this function again upon successful login
        this.retry = this.deactivate.bind(this);
        forceLogin.bind(this)();
      }
      else if(status === 403) {
        //Notify the user that they are not authorised. Reloads the page as they should not be on the admin page
        window.alert(await response.text());
        location.reload();
      }
      else if (status === 500) {
        clearError();
        //The view may have been hidden due to the user being forced to log in on the last attempt
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

  close(residents) {
    //Closes the form and refreshes the table of residents with the updated list of residents to show the changes
    this.container.outerHTML = '';
    this.onClose(residents);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}

class AddResident {
  constructor(onClose) {
    this.onClose = onClose;

    main.insertAdjacentHTML('beforeend', `
      <div id="addResident" class="card str-component ml-1 mr-1 formcard">
        <div class="card-body">
          <form id="resAddForm">
            <div class="form-group">
              <label for="forename">Forename</label>
              <input id="forename" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="surname">Surname</label>
              <input id="surname" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input id="dob" type="date" class="form-control">
            </div>

            <div class="form-group">
              <label for="mvHandling">Moving & Handling</label>
              <input id="mvHandling" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="dietReq">Dietary Requirements</label>
              <input id="dietReq" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="allergies">Allergies</label>
              <input id="allergies" type="text" class="form-control">
            </div>

            <div class="form-group">
              <label for="diabetes">Diabetes</label>
              <select class="form-control" id="diabetes">
                <option value="0">None</option>
                <option value="1">Type 1</option>
                <option value="2">Type 2</option>
              </select>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="thickener">
              <label class="form-check-label" for="thickener">Thickener</label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="dnr">
              <label class="form-check-label" for="dnr">Do Not Resuscitate</label>
            </div>
          </form>

          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger">Cancel</button>
            <button id="btnSave" type="button" class="btn btn-success">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('addResident');
    this.form = document.getElementById('resAddForm');

    this.inputForename = document.getElementById('forename');
    this.inputSurname = document.getElementById('surname');
    this.inputDiet = document.getElementById('dietReq');
    this.inputAllergies = document.getElementById('allergies');
    this.selectDiabetes = document.getElementById('diabetes');
    this.inputThickener = document.getElementById('thickener');
    this.inputDnr = document.getElementById('dnr');

    document.getElementById('btnCancel').addEventListener('click', function() { this.close(); }.bind(this));
    document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
  }

  validateInputs() {
    clearError();
    //Ensure that the forename is not left blank
    if (this.inputForename.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the resident's Forename</div>`);
    }
    //Ensure that the surname is not left blank
    else if (this.inputSurname.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please enter the resident's Surname</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to save the resident's details to the server
        let data = {
          forename: this.inputForename.value,
          surname: this.inputSurname.value,
          birthDate: this.inputBirth.value,
          mvHandling: this.inputMH.value,
          dietReq: this.inputDiet.value,
          allergies: this.inputAllergies.value,
          thickener: this.inputThickener.checked,
          diabetes: parseInt(this.selectDiabetes.value),
          dnr: this.inputDnr.checked
        }

        const response = await fetch(url + '/api/admin/resident/add', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          //Close the form, send updated list of residents back to admin page
          this.close(await json.residents);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin attemps to save the data again upon successful login.
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
          //The view may have been hidden due to the user being forced to log in on the last attempt
          this.show();

          //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data
          this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
          </div>`);
        }
      }
      catch(error) {
        console.error(error);
      }
    }
  }

  close(residents) {
    //Removes the form and refreshes the residents table with the updated list of residents if there is one.
    this.container.outerHTML = '';
    this.onClose(residents);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }
}
