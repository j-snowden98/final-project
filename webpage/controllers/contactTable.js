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
                <th scope="col">${ window.screen.availWidth >= 600 ? 'Description' : '<i class="material-icons">create</i>' }</th>
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