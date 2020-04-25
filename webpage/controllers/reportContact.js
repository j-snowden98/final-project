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
    this.inputOrderSelect.addEventListener('change', this.getContact.bind(this));
    
    //Get the current date and time
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let hour = today.getHours();
    let min  = today.getMinutes();

    //Ensures that the values are in the correct format. The functions return single digits for values less than 10, which are not compatible for html inputs
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    let nowDate = year + "-" + month + "-" + day;
    let nowTime = hour + ":" + min; 

    //By default, contact sheets will be retrieved up to the current date and time
    this.inputEnDate.value = nowDate;      
    this.inputEnTime.value = nowTime;
    
    //Another date is created for exactly 1 day ago
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    day = yesterday.getDate();
    month = yesterday.getMonth() + 1;
    year = yesterday.getFullYear();
    
    //Again must ensure that the month and day are always 2 digits, otherwise it will not work in the HTML input
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    //Start date is yeaterday by default, so contact sheets from the last 24 hours is displayed upon opening the report page
    let yesterdayDate = year + "-" + month + "-" + day;
    this.inputStDate.value = yesterdayDate;
    this.inputStTime.value = nowTime;

    this.getContact.bind(this)();
  }

  async getContact() {
    this.show();
    if(this.validate()) {
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
  }

  validate() {
    clearError();
    const dateFormat = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    const timeFormat = /^\d{2}\:\d{2}$/;
    //Ensure that start date is given in the correct format
    if (!dateFormat.test(this.inputStDate.value)) {
      this.reportPg.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Start date's format is invalid</div>`);
    }
    //Ensure that start time is given in the correct format
    else if (!timeFormat.test(this.inputStTime.value)) {
      this.reportPg.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Start time's format is invalid</div>`);
    }

    //Ensure that end date is given in the correct format
    else if (!dateFormat.test(this.inputEnDate.value)) {
      this.reportPg.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">End date's format is invalid</div>`);
    }

    //Ensure that end time is given in the correct format
    else if (!timeFormat.test(this.inputEnTime.value)) {
      this.reportPg.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">End time's format is invalid</div>`);
    }

    else {
      return true;
    }
  }

  update(rows) {
    //First, clear the table
    this.tblBody.innerHTML = '';
    //Populate the table with all returned contact sheet entries
    for(let r of rows) {
      let newContact = new Contact(r, this.show.bind(this));
      let row = document.createElement('tr');
      row.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.contactDate}</td>
          <td>${r.contactTime}</td>
          <td>${r.resName}</td>
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