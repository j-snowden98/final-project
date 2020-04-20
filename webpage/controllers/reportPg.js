class Report {
  constructor() {
    main.innerHTML = '';
    //Insert the HTML for the admin page, consisting of separate tabs for users, residents and rooms.
    //Each respective tab has its own table which will be populated later by their respective classes
    main.insertAdjacentHTML('beforeend', `
      <div id="adminPg" class="ml-1 mr-1 str-component">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="true">Contact</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="food-tab" data-toggle="tab" href="#food" role="tab" aria-controls="food" aria-selected="false">Food and Fluid</a>
        </li>
        <div class="tab-content" id="reportTabs">
          <div class="tab-pane fade show active" id="contact" role="tabpanel" aria-labelledby="contact-tab">
            <div class="str-component">
              <button class="btn btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseFilters" aria-expanded="false" aria-controls="collapseFilters">
                Filter Contact
              </button>
            </div>
            <div class="collapse" id="collapseFilters">
              <div class="card card-body">
                <form class="my-lg-0 str-component">
                  <div class="form-group form-inline">
                    <label for="userFilter" class="field-label">Username</label>
                    <input id="userFilter" class="form-control" type="text" aria-label="Username">
                  </div>

                  <div class="form-group form-inline">
                    <label for="resFilter">Resident</label>
                    <input id="resFilter" class="form-control" type="text" aria-label="Resident">
                  </div>

                  <div class="form-group form-inline">
                    <label for="stDate">Starting</label>
                    <input id="stDate" class="form-control" type="date" aria-label="Starting">
                    <input id="stTime" class="form-control" type="time" aria-label="Starting">
                  </div>

                  <div class="form-group form-inline">
                    <label for="enDate">Ending</label>
                    <input id="enDate" class="form-control" type="date" aria-label="Ending">
                    <input id="enTime" class="form-control" type="time" aria-label="Ending">
                  </div>

                  <div class="form-group form-inline">
                    <label for="moodFilter">Mood</label>
                    <input id="moodFilter" class="form-control" type="text" aria-label="Mood">
                  </div>

                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="drinkGiven">
                    <label class="form-check-label" for="drinkGiven">
                      Only when drinks are given
                    </label>
                  </div>
                  
                  <button id="addUserBtn" type="button" title="Apply filters" class="btn btn-success">Apply filters</button>
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
          <div class="tab-pane fade" id="food" role="tabpanel" aria-labelledby="food-tab"></div>
        </div>
      </div>`);


    //Show that the report page is now selected
    document.getElementById('homeBtn').classList.remove('active');
    document.getElementById('adminBtn').classList.remove('active');
    document.getElementById('reportBtn').classList.add('active');

    //Prevents the user clicking on the report page while it is selected
    document.getElementById('reportBtn').removeEventListener('click', loadReport);
    document.getElementById('adminBtn').addEventListener('click', loadAdmin);
  }
}
  
  