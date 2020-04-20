class ReportContact {
  constructor() {
    this.InputUserFilter = document.getElementById('userFilter');
    this.inputResFilter = document.getElementById('resFilter');
    this.inputStDate = document.getElementById('stDate');
    this.inputStTime = document.getElementById('stTime');
    this.inputEnDate = document.getElementById('enDate');
    this.inputEnTime = document.getElementById('enTime');
    this.inputDrinkGiven = document.getElementById('drinkGiven');
    this.inputMoodFilter = document.getElementById('moodFilter');
    this.inputOrderSelect = document.getElementById('orderSelect');
    
    this.reportPg = document.getElementById('reportPg');
    this.tblBody = document.getElementById('reportContactBody');
    document.getElementById('applyFilter').addEventListener('click', this.getContact.bind(this));
    
    this.getContact.bind(this)();
  }

  async getContact() {
    try {
      //Send request to server to search for residents with a given filter
      let userFilter = this.InputUserFilter.value;
      let resFilter = this.inputResFilter.value;
      let afterDate = this.inputStDate.value;
      let afterTime = this.inputStTime.value;
      let beforeDate = this.inputEnDate.value;
      let beforeTime = this.inputEnTime.value;
      let drinkGiven = this.inputDrinkGiven.checked;
      let moodFilter = this.inputMoodFilter.value;
      let orderBy = this.inputOrderSelect.value;

      const response = await fetch(url + `/api/report/contact?userFilter=${userFilter}&resFilter=${resFilter}&afterDate=${afterDate}&afterTime=${afterTime}&beforeDate=${beforeDate}&beforeTime=${beforeTime}&drinkGiven=${drinkGiven}&moodFilter=${moodFilter}&orderBy=${orderBy}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      const status = await response.status;

      if(status === 200) {
        const json = await response.json();
        this.update(json.contact);
      }
      else if(status === 401) {
        //Hide report view, then display the login view
        this.hide();

        //Upon successful login, the report view is reloaded and populated with the filtered data
        this.retry = this.getContact.bind(this);
        forceLogin.bind(this)();
      }
      else if(status === 403) {
        //Notify the user that they do not have the report permission. Return to the main residents view by reloading the page.
        window.alert(await response.text());
        location.reload();
      }
      else if (status === 500) {
        clearError();
        //The view may have been hidden due to the user being forced to log in on the last attempt
        this.show();

        //Notify user there has been an error
        this.reportPg.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
        </div>`);
      }

    } catch(error) {
      console.error('Error:', error);
    }
  }

  update(rows) {
    //Populate the table with all returned contact sheet entries
    for(let r of rows) {
      let newContact = new Contact(r, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.contactDate}</td>
          <td>${r.contactTime}</td>
          <td>${Boolean(r.drinkGiven)? 'Yes' : 'No'}</td>
          <td>${r.description}</td>
          <td>${r.mood}</td>
          <td>${r.username}</td>
        </tr>`);

      //Display information for this contact sheet entry when its respective row is clicked
      this.tblBody.appendChild(row);
      row.addEventListener('click', function() {
        this.hide();
        newContact.display.bind(newContact)();
      }.bind(this));
    }
  }

  hide() {
    this.reportPg.setAttribute('style', 'display: none');
  }

  show() {
    this.reportPg.setAttribute('style', 'display: block');
  }
}