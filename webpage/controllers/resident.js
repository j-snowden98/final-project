class Resident {
  constructor(resObject) {
    //Setting its properties to that of resObject (which has been retrieved from DB)
    this.id = resObject.id;
    this.forename = resObject.forename;
    this.surname = resObject.surname;
    this.birthDate = resObject.dob;
    this.mvHandling = resObject.mvHandling;
    this.dietReq = resObject.dietReq;
    this.allergies = resObject.allergies;
    this.thickener = Boolean(resObject.thickener);
    this.diabetes = resObject.diabetes;
    this.dnr = Boolean(resObject.dnr);
    this.roomName = resObject.roomName;
  }

  openResMenu() {
    //Hide table of residents
    resTbl.hide();
    main.insertAdjacentHTML('beforeend', `
      <div id="resOptions" class="ml-1 mr-1">
        <button id="backBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component formcard">
          <div class="card-body">
            <h5 class="card-title">${this.forename + ' ' + this.surname}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${this.roomName}</h6>
            <h7 class="card-subtitle mb-2 text-muted">${this.birthDate}</h7>
            <p class="card-text">Moving & Handling: ${this.mvHandling === ''? 'None' : this.mvHandling}</p>
            <p class="card-text">Dietary Requirements: ${this.dietReq === ''? 'None' : this.dietReq}</p>
            <p class="card-text">Allergies: ${this.allergies === ''? 'None' : this.allergies}</p>
            <p class="card-text">Thickener: ${!this.thickener? 'No' : 'Yes'}</p>
            <p class="card-text">Diabetes: ${this.diabetes === 0? 'No' : 'Type ' + this.diabetes}</p>
            ${this.dnr? '<p class="card-text dnr">Do Not Resuscitate</p>' : ''}
            <button id="btnContact" type="button" class="btn btn-secondary btn">Contact</button>
          </div>
        </div>
      </div>`);
    document.getElementById('backBtn').addEventListener('click', this.prevClick.bind(this));

    //Open contact table for this resident when button is clicked
    document.getElementById('btnContact').addEventListener('click', this.showContact.bind(this));

    //Open food & fluid table for this resident when button is clicked
    document.getElementById('btnFood').addEventListener('click', this.showFoodFl.bind(this));
    this.resOptions = document.getElementById('resOptions');
  }

  prevClick(){
    //Clears resident menu, goes back to table of residents.
    this.resOptions.outerHTML = '';
    resTbl.show();
  }

  showContact() {
    //Opens contact table for this resident
    this.resOptions.outerHTML = '';
    const ct = new ContactTable(this.id, this.openResMenu.bind(this));
  }
}