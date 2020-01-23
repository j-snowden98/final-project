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

    describe('Get residents by forename', async(done) => {
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

    describe('Get residents by surname', async(done) => {
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

    describe('Get residents by forename and surname', async(done) => {
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

    describe('Get residents by room number', async(done) => {
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

    describe('Get residents with substrings in forename, surname or roomName', async(done) => {
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

    /*describe('Create one contact sheet entry for 4 different residents', () => {
      it('Add a contact entry for Lionel Lundstrom, then searchContact should be of length 1', async() => {
        let residents = await dataModel.getResidents('Lionel');
        let id = residents[0].id;
        let addContact = await dataModel.insertContact(id);
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
    });*/
  });
});
