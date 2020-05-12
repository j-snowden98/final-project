class Contact {
  constructor(object, goBack) {
    //Sets attributes to the same as contact entry object (from DB)
    this.contactDate = object.contactDate;
    this.resName = object.resName;
    this.contactTime = object.contactTime;
    this.callBell = object.callBell;
    this.drinkGiven = object.drinkGiven;
    this.description = object.description;
    this.mood = object.mood;
    this.username = object.username;
    this.goBack = goBack;
  }

  display() {
    //Display the details of this contact sheet entry
    const html = `
      <div id="dispContact" class="ml-1 mr-1">
        <button id="closeContact" type="button" class="btn btn-lg btn-outline-secondary">&#8249;</button>
        <div class="card str-component formcard">
          <div class="card-body">
            <form>
            <h5 class="card-title">${this.resName}</h5>
              <label>Time entered: ${this.contactDate + ' ' + this.contactTime}</label>
              <label>Entered by: ${this.username}</label>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" ${Boolean(this.callBell) ? 'checked="true"' : ''} id="callBell" disabled>
                <label class="form-check-label" for="callBell">Call Bell</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" ${Boolean(this.drinkGiven) ? 'checked="true"' : ''} id="drinkGiven" disabled>
                <label class="form-check-label" for="drinkGiven">
                  Drink Given
                </label>
              </div>
              <div class="form-group">
                <label for="desc">Care And Contact</label>
                <textarea class="form-control" id="desc" rows="6" readonly>${this.description}</textarea>
              </div>
              <div class="form-group">
                <label for="mood">Mood</label>
                <textarea class="form-control" id="mood" rows="3" readonly>${this.mood}</textarea>
              </div>
            </form>
          </div>
        </div>
      </div>`
    main.insertAdjacentHTML('beforeend', html);
    this.container = document.getElementById('dispContact');

    //Back button returns to contact list view
    document.getElementById('closeContact').addEventListener('click', this.close.bind(this));
  }

  close() {
    //Clear this view and return to previous view
    this.container.outerHTML = '';
    this.goBack();
  }
}