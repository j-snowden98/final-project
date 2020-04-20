class AddContact {
  constructor(resID, onCancel, added) {
    //resID given so the entry can be saved to the residents ID
    //onCancel function allows user to return to previous screen and not save changes
    //added function to be called once entry has been successfully saved
    this.resID = resID;
    this.onCancel = onCancel;
    this.added = added;
    main.insertAdjacentHTML('beforeend', `
      <div id="addContact" class="card str-component ml-1 mr-1 formcard">
        <div class="card-body">
          <form>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="callBell">
              <label class="form-check-label" for="callBell">
                Call Bell
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="drinkGiven">
              <label class="form-check-label" for="drinkGiven">
                Drink Given
              </label>
            </div>
            <div class="form-group">
              <label for="desc">Care And Contact</label>
              <textarea class="form-control" id="desc" rows="6" spellcheck="true"></textarea>
            </div>
            <div class="form-group">
              <label for="mood">Mood</label>
              <select class="form-control" id="moodSelect">
                <option>Calm</option>
                <option>Amused</option>
                <option>Cheerful</option>
                <option>Content</option>
                <option>Happy</option>
                <option>Peaceful</option>
                <option>Sad</option>
                <option>Stressed</option>
                <option>Restless</option>
                <option>Angry</option>
                <option>Grumpy</option>
                <option>Irritated</option>
                <option>Other</option>
              </select>
              <textarea class="form-control" id="mood" rows="3" spellcheck="true" placeholder="If 'Other', please specify."></textarea>
            </div>
          </form>
          <div class="str-btn">
            <button id="btnCancel" type="button" class="btn btn-danger btn">Cancel</button>
            <button id="btnSave" type="button" class="btn btn-success btn">Save</button>
          </div>
        </div>
      </div>
    `);
    this.container = document.getElementById('addContact');

    this.callBell = document.getElementById('callBell');
    this.drinkGiven = document.getElementById('drinkGiven');
    this.desc = document.getElementById('desc');
    this.moodSelect = document.getElementById('moodSelect');
    this.mood = document.getElementById('mood')

    this.moodSelect.addEventListener('change', this.moodChange.bind(this));
    this.mood.setAttribute('readonly', 'true');

    document.getElementById('btnCancel').addEventListener('click', function() { this.remove(this.onCancel); }.bind(this));
    document.getElementById('btnSave').addEventListener('click', this.save.bind(this));
  }

  moodChange() {
    if (this.moodSelect.value == "Other") {
      this.mood.removeAttribute('readonly');
    }
    else {
      this.mood.value = '';
      this.mood.setAttribute('readonly', 'true');
    }
  }

  remove(callback, json) {
    //Remove will call the given function with json as a parameter. This goes back to contact table and updates with new row from json parameter.
    this.container.outerHTML = '';
    callback(json);
  }

  hide() {
    this.container.setAttribute('style', 'display: none');
  }

  show() {
    this.container.setAttribute('style', 'display: flex');
  }

  validateInputs() {
    clearError();
    if (this.desc.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please fill in the Care and Contact section.</div>`);
    }
    else if (this.moodSelect.value === 'Other' && this.mood.value === '') {
      this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-danger" role="alert">Please fill in the Mood section.</div>`);
    }
    else {
      return true;
    }
  }

  async save() {
    if (this.validateInputs()) {
      try {
        //Attempt to save the new entry to the server
        let data = {
          resID: this.resID,
          callBell: this.callBell.checked,
          drinkGiven: this.drinkGiven.checked,
          description: this.desc.value,
          mood: this.moodSelect.value === 'Other' ? this.mood.value : this.moodSelect.value
        }
        const response = await fetch(url + '/api/resident/contact/add', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const status = await response.status;

        if(status === 200) {
          const json = await response.json();
          this.remove(this.added, json.new);
        }
        else if(status === 401) {
          //Hide form before showing login form
          this.hide();

          //Forcelogin uses retry from 'this' upon successful login.
          this.retry = this.save.bind(this);
          forceLogin.bind(this)();
        }
        else if(status === 403) {
          //Notify the user that they are not authorised. Go back to previous state
          window.alert(await response.text());
          this.onCancel();
        }
        else if (status === 500) {
          clearError();
          //The view may have been hidden due to the user being forced to log in on the last attempt
          this.show();

          //Notify user there has been an error. Leaves the form as it is in case they want to try again and keep the data.
          //User can also click cancel at this point
          this.container.insertAdjacentHTML('afterBegin', `<div id="errorAlert" class="alert alert-warning" role="alert">There was an error. Please try again later.
          </div>`);
        }
      }
      catch(error) {
        console.error(error);
      }
    }
  }
}