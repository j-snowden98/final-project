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

  openResDetails() {
    //Hide table of residents
    resTbl.hide();
    main.insertAdjacentHTML('beforeend', `
      <div id="resDetails" class="ml-1 mr-1">
        <button id="resBackBtn" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
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
    document.getElementById('resBackBtn').addEventListener('click', this.prevClick.bind(this));

    //Open contact table for this resident when button is clicked
    document.getElementById('btnContact').addEventListener('click', this.showContact.bind(this));

    this.resDetails = document.getElementById('resDetails');
  }

  prevClick(){
    //Clears resident details view, returns to residents list view.
    this.resDetails.outerHTML = '';
    resTbl.show();
  }

  showContact() {
    //Opens contact table for this resident
    this.hide();
    const ct = new ContactTable(this.id, this.show.bind(this));
  }

  show() {
    this.resDetails.setAttribute('style', 'display: block');
  }

  hide() {
    this.resDetails.setAttribute('style', 'display: none');
  }
}