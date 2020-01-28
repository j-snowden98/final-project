const should = require('chai').should();
const dataModel = require('../server/db/model_mysql.js');

describe('Data model tests', () => {
  describe('Residents', () => {
    describe('Get all residents', () => {
      it('it should return all the residents', async() => {
        let residents = await dataModel.getResidents('');
        residents.should.have.lengthOf(12);
        residents[0].roomName.should.deep.equal('A1');
        residents[11].roomName.should.deep.equal('C200');
      });
    });

    describe('Get residents by forename', async() => {
      it('it should return 1 resident with name Curtis', async() => {
        let residents = await dataModel.getResidents('Curtis');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Curtis');
      });

      it('it should return 1 resident with name Lionel', async() => {
        let residents = await dataModel.getResidents('Lionel');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Lionel');
      });

      it('it should return 1 resident with name Sylvester', async() => {
        let residents = await dataModel.getResidents('Sylvester');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Sylvester');
      });

      it('it should return 1 resident with name Ulysses', async() => {
        let residents = await dataModel.getResidents('Ulysses');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Ulysses');
      });
    });

    describe('Get residents by surname', async() => {
      it('it should return 1 resident with name Lundstrom', async() => {
        let residents = await dataModel.getResidents('Lundstrom');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Lundstrom');
      });

      it('it should return 1 resident with name Devine', async() => {
        let residents = await dataModel.getResidents('Devine');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Devine');
      });

      it('it should return 1 resident with name Longshore', async() => {
        let residents = await dataModel.getResidents('Longshore');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Longshore');
      });

      it('it should return 1 resident with name Chausse', async() => {
        let residents = await dataModel.getResidents('Chausse');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Chausse');
      });
    });

    describe('Get residents by forename and surname', async() => {
      it('it should return 1 resident with name Lionel Lundstrom', async() => {
        let residents = await dataModel.getResidents('Lionel Lundstrom');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Lundstrom');
      });

      it('it should return 1 resident with name Del Devine', async() => {
        let residents = await dataModel.getResidents('Del Devine');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Devine');
      });

      it('it should return 1 resident with name Odell Longshore', async() => {
        let residents = await dataModel.getResidents('Odell Longshore');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Longshore');
      });

      it('it should return 1 resident with name Refugio Chausse', async() => {
        let residents = await dataModel.getResidents('Refugio Chausse');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Chausse');
      });
    });

    describe('Get residents by room number', async() => {
      it('it should return residents in rooms with room number including 1', async() => {
        let residents = await dataModel.getResidents('1');
        residents.should.have.lengthOf(5);
        residents[0].roomName.should.deep.equal('A1');
        residents[4].roomName.should.deep.equal('C1');
      });

      it('it should return residents in rooms with room number including 2', async() => {
        let residents = await dataModel.getResidents('2');
        residents.should.have.lengthOf(5);
        residents[0].roomName.should.deep.equal('A2');
        residents[4].roomName.should.deep.equal('C200');
      });

      it('it should return residents in rooms with room number including 20', async() => {
        let residents = await dataModel.getResidents('20');
        residents.should.have.lengthOf(2);
        residents[0].roomName.should.deep.equal('A201');
        residents[1].roomName.should.deep.equal('C200');
      });

      it('it should return residents in rooms with room number including A2', async() => {
        let residents = await dataModel.getResidents('A2');
        residents.should.have.lengthOf(2);
        residents[0].roomName.should.deep.equal('A2');
        residents[1].roomName.should.deep.equal('A201');
      });
    });

    describe('Get residents with substrings in forename, surname or roomName', async() => {
      it('it should return residents with forename, surname or roomName containing substring a', async() => {
        let residents = await dataModel.getResidents('a');
        residents.should.have.lengthOf(9);
        residents[0].roomName.should.deep.equal('A1');
        residents[8].roomName.should.deep.equal('C200');
      });

      it('it should return residents with forename, surname or roomName containing substring b', async() => {
        let residents = await dataModel.getResidents('b');
        residents.should.have.lengthOf(6);
        residents[0].roomName.should.deep.equal('B1');
        residents[5].roomName.should.deep.equal('C200');
      });

      it('it should return residents with forename, surname or roomName containing substring c', async() => {
        let residents = await dataModel.getResidents('c');
        residents.should.have.lengthOf(6);
        residents[0].roomName.should.deep.equal('A3');
        residents[5].roomName.should.deep.equal('C200');
      });

      it('it should return residents with forename, surname or roomName containing substring rm', async() => {
        let residents = await dataModel.getResidents('rm');
        residents.should.have.lengthOf(2);
        residents[0].roomName.should.deep.equal('B5');
        residents[1].roomName.should.deep.equal('C200');
      });
    });
  });

  describe('Contact', () => {
    describe('Retrieve empty contact sheets for 4 different residents', () => {
      it('Contact for Lionel Lundstrom should be empty so far', async() => {
        let residents = await dataModel.getResidents('Lionel');
        let id = residents[0].id;
        let contact = await dataModel.searchContact(id);
        contact.should.have.lengthOf(0);
      });

      it('Contact for Del Devine should be empty so far', async() => {
        let residents = await dataModel.getResidents('Devine');
        let id = residents[0].id;
        let contact = await dataModel.searchContact(id);
        contact.should.have.lengthOf(0);
      });

      it('Contact for Hollis Happ should be empty so far', async() => {
        let residents = await dataModel.getResidents('Hollis');
        let id = residents[0].id;
        let contact = await dataModel.searchContact(id);
        contact.should.have.lengthOf(0);
      });

      it('Contact for Odell Longshore should be empty so far', async() => {
        let residents = await dataModel.getResidents('Odell');
        let id = residents[0].id;
        let contact = await dataModel.searchContact(id);
        contact.should.have.lengthOf(0);
      });
    });

    describe('Create one contact sheet entry for 4 different residents', () => {
      it('Add a contact entry for Lionel Lundstrom, then searchContact should be of length 1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(0);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact.should.have.lengthOf(1);
        }
      });

      it('Add a contact entry for Del Devine, then searchContact should be of length 1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Devine');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(0);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact.should.have.lengthOf(1);
        }
      });

      it('Add a contact entry for Hollis Happ, then searchContact should be of length 1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Hollis');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(0);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact.should.have.lengthOf(1);
        }
      });

      it('Add a contact entry for Odell Longshore, then searchContact should be of length 1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Odell');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(0);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact.should.have.lengthOf(1);
        }
      });
    });

    describe('Add new contact entries for Lionel Lundstrom, testing call bell and drink given', () => {
      it('Add a contact entry for Lionel Lundstrom, call bell and drink given both false', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(1);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          Boolean(contact[0].callBell).should.deep.equal(false);
          Boolean(contact[0].drinkGiven).should.deep.equal(false);
          contact.should.have.lengthOf(2);
        }
      });

      it('Add a contact entry for Lionel Lundstrom, call bell is true and drink given is false', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(2);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, false, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          Boolean(contact[0].callBell).should.deep.equal(true);
          Boolean(contact[0].drinkGiven).should.deep.equal(false);
          contact.should.have.lengthOf(3);
        }
      });

      it('Add a contact entry for Lionel Lundstrom, call bell is false and drink given is true', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(3);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          Boolean(contact[0].callBell).should.deep.equal(false);
          Boolean(contact[0].drinkGiven).should.deep.equal(true);
          contact.should.have.lengthOf(4);
        }
      });

      it('Add a contact entry for Lionel Lundstrom, call bell and drink given both true', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(4);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'Example contact sheet info', 'Resident is relaxed');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          Boolean(contact[0].callBell).should.deep.equal(true);
          Boolean(contact[0].drinkGiven).should.deep.equal(true);
          contact.should.have.lengthOf(5);
        }
      });
    });
    describe('Add new contact entries for Lionel Lundstrom, testing description and mood', () => {
      it('Add a contact entry for Lionel Lundstrom, description = description1, mood = mood1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(5);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description1', 'mood1');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].description.should.deep.equal('description1');
          contact[0].mood.should.deep.equal('mood1');
          contact.should.have.lengthOf(6);
        }
      });

      it('Add a contact entry for Lionel Lundstrom, description = description2, mood = mood2', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(6);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description2', 'mood2');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].description.should.deep.equal('description2');
          contact[0].mood.should.deep.equal('mood2');
          contact.should.have.lengthOf(7);
        }
      });

      it('Add a contact entry for Lionel Lundstrom, description = description3, mood = mood3', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Check that resident's contact is empty to begin with
        let contact = await dataModel.searchContact(resID);
        contact.should.have.lengthOf(7);

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description3', 'mood3');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].description.should.deep.equal('description3');
          contact[0].mood.should.deep.equal('mood3');
          contact.should.have.lengthOf(8);
        }
      });
    });

    describe('Add new contact entries for Lionel Lundstrom, testing different users', () => {
      it('Add a contact entry for Lionel Lundstrom with user test1', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description1', 'mood1');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].username.should.deep.equal('test1');
        }
      });

      it('Add a contact entry for Lionel Lundstrom with user test2', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test2');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description1', 'mood1');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].username.should.deep.equal('test2');
        }
      });

      it('Add a contact entry for Lionel Lundstrom with user test3', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test3');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description1', 'mood1');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].username.should.deep.equal('test3');
        }
      });

      it('Add a contact entry for Lionel Lundstrom with user test4', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Lionel');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test4');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'description1', 'mood1');

        if(addContact) {
          //Get contact for resident
          contact = await dataModel.searchContact(resID);
          contact[0].username.should.deep.equal('test4');
        }
      });
    });

    describe('Test getNewContact to ensure the newest contact entry is retrieved', () => {
      it('Add a contact entry for Hollis Happ and test that the same one is returned by getNewContact', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Hollis');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, false, 'unique description 1', 'unique mood 1');

        if(addContact) {
          //Get top contact entry for resident
          contact = await dataModel.getNewContact(resID);
          contact.username.should.deep.equal('test1');
          Boolean(contact.callBell).should.deep.equal(true);
          Boolean(contact.drinkGiven).should.deep.equal(false);
          contact.description.should.deep.equal('unique description 1');
          contact.mood.should.deep.equal('unique mood 1');
        }
      });

      it('Add a contact entry for Hollis Happ and test that the same one is returned by getNewContact', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Hollis');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, true, true, 'unique description 2', 'unique mood 2');

        if(addContact) {
          //Get top contact entry for resident
          contact = await dataModel.getNewContact(resID);
          contact.username.should.deep.equal('test1');
          Boolean(contact.callBell).should.deep.equal(true);
          Boolean(contact.drinkGiven).should.deep.equal(true);
          contact.description.should.deep.equal('unique description 2');
          contact.mood.should.deep.equal('unique mood 2');
        }
      });

      it('Add a contact entry for Hollis Happ and test that the same one is returned by getNewContact', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Hollis');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, false, 'unique description 3', 'unique mood 3');

        if(addContact) {
          //Get top contact entry for resident
          contact = await dataModel.getNewContact(resID);
          contact.username.should.deep.equal('test1');
          Boolean(contact.callBell).should.deep.equal(false);
          Boolean(contact.drinkGiven).should.deep.equal(false);
          contact.description.should.deep.equal('unique description 3');
          contact.mood.should.deep.equal('unique mood 3');
        }
      });

      it('Add a contact entry for Hollis Happ and test that the same one is returned by getNewContact', async() => {
        //Get resID
        let residents = await dataModel.getResidents('Hollis');
        let resID = residents[0].id;

        //Get userID
        let result = await dataModel.getHash('test1');
        let userID = await result.id;

        //Save contact entry
        let addContact = await dataModel.insertContact(resID, userID, false, true, 'unique description 4', 'unique mood 4');

        if(addContact) {
          //Get top contact entry for resident
          contact = await dataModel.getNewContact(resID);
          contact.username.should.deep.equal('test1');
          Boolean(contact.callBell).should.deep.equal(false);
          Boolean(contact.drinkGiven).should.deep.equal(true);
          contact.description.should.deep.equal('unique description 4');
          contact.mood.should.deep.equal('unique mood 4');
        }
      });
    });
  });

  /*describe('isAuthorised', () => {
    describe('Retrieve empty contact sheets for 4 different residents', () => {
      it('Contact for Lionel Lundstrom should be empty so far', async() => {
        let residents = await dataModel.getResidents('Lionel');
        let id = residents[0].id;
        let contact = await dataModel.searchContact(id);
        contact.should.have.lengthOf(0);
      });
    });
  });*/
});
