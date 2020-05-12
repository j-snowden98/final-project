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
            <input id="searchbar" class="form-control" type="search" placeholder="Search" aria-label="Search">
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
        addNavbar(json.username, json.admin, json.report);
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
    this.show();
    
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
      row.addEventListener('click', newRes.openResDetails.bind(newRes));
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