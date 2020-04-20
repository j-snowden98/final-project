class Report {
  constructor() {
    main.innerHTML = '';
    //Insert the HTML for the admin page, consisting of separate tabs for users, residents and rooms.
    //Each respective tab has its own table which will be populated later by their respective classes
    main.insertAdjacentHTML('beforeend', `
      <div id="reportPg" class="ml-1 mr-1 str-component">
        <form class="form-inline str-component">
          <button class="btn btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseFilters" aria-expanded="false" aria-controls="collapseFilters">
            Filter Contact
          </button>

          <select class="form-control admin-search ml-1" id="orderSelect">
            <option value="0">Date (Ascending)</option>
            <option value="1">Date (Descending)</option>
            <option value="2">Resident name (Ascending)</option>
            <option value="3">Resident name (Descending)</option>
          </select>
        </form>
        <div class="collapse" id="collapseFilters">
          <div class="card card-body">
            <form class="my-lg-0 str-component">
              <div class="form-group form-inline">
                <label for="userFilter" class="field-label">Username</label>
                <input id="userFilter" class="form-control" type="text" aria-label="Username">
              </div>

              <div class="form-group form-inline">
                <label for="resFilter" class="field-label">Resident</label>
                <input id="resFilter" class="form-control" type="text" aria-label="Resident">
              </div>

              <div class="form-group form-inline">
                <label for="stDate" class="field-label">Starting</label>
                <input id="stDate" class="form-control" type="date" aria-label="Starting">
                <input id="stTime" class="form-control ml-1" type="time" aria-label="Starting">
              </div>

              <div class="form-group form-inline">
                <label for="enDate" class="field-label">Ending</label>
                <input id="enDate" class="form-control" type="date" aria-label="Ending">
                <input id="enTime" class="form-control ml-1" type="time" aria-label="Ending">
              </div>

              <div class="form-group form-inline">
                <label for="moodFilter" class="field-label">Mood</label>
                <input id="moodFilter" class="form-control" type="text" aria-label="Mood">
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="drinkGiven">
                <label class="form-check-label" for="drinkGiven">
                  Only when drinks are given
                </label>
              </div>
              
              <button id="applyFilter" type="button" title="Apply filters" class="btn btn-success mt-2">Apply filters</button>
            </form>
          </div>
        </div>
        
        <table class="table table-str table-striped table-dark str-component rounded">
          <thead>
            <tr>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'Date' : '<i class="material-icons">calendar_today</i>' }</th>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'Time' : '<i class="material-icons">access_time</i>' }</th>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'Drink Given' : '<i class="material-icons">local_cafe</i>' }</th>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'Descripion' : '<i class="material-icons">create</i>' }</th>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'Mood' : '<i class="material-icons">sentiment_satisfied</i>' }</th>
              <th scope="col">${ window.screen.availWidth >= 800 ? 'User' : '<i class="material-icons">account_circle</i>' }</th>
            </tr>
          </thead>
          <tbody id="reportContactBody"></tbody>
        </table>
      </div>
      </div>`);
    
    const contact = new ReportContact();

    //Show that the report page is now selected
    document.getElementById('homeBtn').classList.remove('active');
    document.getElementById('adminBtn').classList.remove('active');
    document.getElementById('reportBtn').classList.add('active');

    //Prevents the user clicking on the report page while it is selected.
    //Also ensures the user can switch to the admin view (if they are permitted)
    document.getElementById('reportBtn').removeEventListener('click', loadReport);
    document.getElementById('adminBtn').addEventListener('click', loadAdmin);
  }
}
  
  