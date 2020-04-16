const should = require('chai').should();
const dataModel = require('../server/db/model_mysql.js');
const adminModel = require('../server/db/admin_model_mysql.js');

describe('Admin data model tests', () => {
  describe('Manage Users', () => {
    describe('Add various users', () => {
      it('Should add a new user with username carer01', async() => {
        let users = await adminModel.addUser('carer01', 'securepassword', 'Carer', [1, 2, 3, 4]);
        users.should.have.lengthOf(6);
        users[0].username.should.deep.equal('carer01');
        users[0].role.should.deep.equal('Carer');
      });

      it('Should add a new user with username carer02', async() => {
        let users = await adminModel.addUser('carer02', 'securepassword', 'Carer', [1]);
        users.should.have.lengthOf(7);
        users[1].username.should.deep.equal('carer02');
        users[1].role.should.deep.equal('Carer');
      });

      it('Should add a new user with username carer03', async() => {
        let users = await adminModel.addUser('carer03', 'securepassword', 'Carer', [2, 3]);
        users.should.have.lengthOf(8);
        users[2].username.should.deep.equal('carer03');
        users[2].role.should.deep.equal('Carer');
      });

      it('Should add a new user with username carer04', async() => {
        let users = await adminModel.addUser('carer04', 'securepassword', 'Carer', [1, 4]);
        users.should.have.lengthOf(9);
        users[3].username.should.deep.equal('carer04');
        users[3].role.should.deep.equal('Carer');
      });
    });

    describe('Get permissions', () => {
      it('Get permissions for carer01', async() => {
        let result = await adminModel.searchUsers('carer01');
        let userID = await result[0].id;
        let permissions = await adminModel.getPermissions(userID);
        permissions[0].type.should.deep.equal(1);
        permissions[0].userID.should.deep.equal(userID);
        permissions[1].type.should.deep.equal(2);
        permissions[1].userID.should.deep.equal(userID);
        permissions[2].type.should.deep.equal(3);
        permissions[2].userID.should.deep.equal(userID);
        permissions[3].type.should.deep.equal(4);
        permissions[3].userID.should.deep.equal(userID);
        permissions[4].type.should.deep.equal(5);
        should.equal(permissions[4].userID, null);
        permissions[5].type.should.deep.equal(6);
        should.equal(permissions[5].userID, null);
      });

      it('Get permissions for carer02', async() => {
        let result = await adminModel.searchUsers('carer02');
        let userID = await result[0].id;
        let permissions = await adminModel.getPermissions(userID);
        permissions[0].type.should.deep.equal(1);
        permissions[0].userID.should.deep.equal(userID);
        permissions[1].type.should.deep.equal(2);
        should.equal(permissions[1].userID, null);
        permissions[2].type.should.deep.equal(3);
        should.equal(permissions[2].userID, null);
        permissions[3].type.should.deep.equal(4);
        should.equal(permissions[3].userID, null);
        permissions[4].type.should.deep.equal(5);
        should.equal(permissions[4].userID, null);
        permissions[5].type.should.deep.equal(6);
        should.equal(permissions[5].userID, null);
      });

      it('Get permissions for carer03', async() => {
        let result = await adminModel.searchUsers('carer03');
        let userID = await result[0].id;
        let permissions = await adminModel.getPermissions(userID);
        permissions[0].type.should.deep.equal(1);
        should.equal(permissions[0].userID, null);
        permissions[1].type.should.deep.equal(2);
        permissions[1].userID.should.deep.equal(userID);
        permissions[2].type.should.deep.equal(3);
        permissions[2].userID.should.deep.equal(userID);
        permissions[3].type.should.deep.equal(4);
        should.equal(permissions[3].userID, null);
        permissions[4].type.should.deep.equal(5);
        should.equal(permissions[4].userID, null);
        permissions[5].type.should.deep.equal(6);
        should.equal(permissions[5].userID, null);
      });

      it('Get permissions for carer04', async() => {
        let result = await adminModel.searchUsers('carer04');
        let userID = await result[0].id;
        let permissions = await adminModel.getPermissions(userID);
        permissions[0].type.should.deep.equal(1);
        permissions[0].userID.should.deep.equal(userID);
        permissions[1].type.should.deep.equal(2);
        should.equal(permissions[1].userID, null);
        permissions[2].type.should.deep.equal(3);
        should.equal(permissions[2].userID, null);
        permissions[3].type.should.deep.equal(4);
        permissions[3].userID.should.deep.equal(userID);
        permissions[4].type.should.deep.equal(5);
        should.equal(permissions[4].userID, null);
        permissions[5].type.should.deep.equal(6);
        should.equal(permissions[5].userID, null);
      });
    });

    describe('Search Users', () => {
      it('Search with no filter, should return all users', async() => {
        let users = await adminModel.searchUsers('');
        users.should.have.lengthOf(9);
      });

      it('Search users with test, should return all users with substring test in their username', async() => {
        let users = await adminModel.searchUsers('test');
        users.should.have.lengthOf(4);
      });

      it('Search users with 1, should return all users with 1 in username or role', async() => {
        let users = await adminModel.searchUsers('1');
        users.should.have.lengthOf(2);
      });

      it('Search users with carer, should return all users with carer in username or role', async() => {
        let users = await adminModel.searchUsers('carer');
        users.should.have.lengthOf(8);
      });
    });

    describe('Set permissions', () => {
      it('Reset the permissions for carer01 to 1 and 3', async() => {
        let result = await adminModel.searchUsers('carer01');
        let userID = await result[0].id;
        let permissionsChanged = await adminModel.setPermissions(userID, [1, 3]);
        if (await permissionsChanged) {
          let permissions = await adminModel.getPermissions(userID);
          permissions[0].type.should.deep.equal(1);
          permissions[0].userID.should.deep.equal(userID);
          permissions[1].type.should.deep.equal(2);
          should.equal(permissions[1].userID, null);
          permissions[2].type.should.deep.equal(3);
          permissions[2].userID.should.deep.equal(userID);
          permissions[3].type.should.deep.equal(4);
          should.equal(permissions[3].userID, null);
          permissions[4].type.should.deep.equal(5);
          should.equal(permissions[4].userID, null);
          permissions[5].type.should.deep.equal(6);
          should.equal(permissions[5].userID, null);
        }
      });

      it('Reset permissions for carer04 to 2 and 4', async() => {
        let result = await adminModel.searchUsers('carer01');
        let userID = await result[0].id;
        let permissionsChanged = await adminModel.setPermissions(userID, [2, 4]);
        if (await permissionsChanged) {
          let permissions = await adminModel.getPermissions(userID);
          permissions[0].type.should.deep.equal(1);
          should.equal(permissions[0].userID, null);
          permissions[1].type.should.deep.equal(2);
          permissions[1].userID.should.deep.equal(userID);
          permissions[2].type.should.deep.equal(3);
          should.equal(permissions[2].userID, null);
          permissions[3].type.should.deep.equal(4);
          permissions[3].userID.should.deep.equal(userID);
          permissions[4].type.should.deep.equal(5);
          should.equal(permissions[4].userID, null);
          permissions[5].type.should.deep.equal(6);
          should.equal(permissions[5].userID, null);
        }
      });
    });

    describe('Reset password', () => {
      it('Reset password for carer01', async() => {
        let result = await adminModel.searchUsers('carer01');
        let userID = await result[0].id;
        let passwordChanged = await adminModel.resetPassword(userID, 'newcarer01password');
        if (passwordChanged) {
          result = await dataModel.getHash('carer01');
          let password = await result.password;
          password.should.deep.equal('newcarer01password');
        }
      });

      it('Reset password for carer03', async() => {
        let result = await adminModel.searchUsers('carer03');
        let userID = await result[0].id;
        let passwordChanged = await adminModel.resetPassword(userID, 'newcarer03password');
        if (passwordChanged) {
          result = await dataModel.getHash('carer03');
          let password = await result.password;
          password.should.deep.equal('newcarer03password');
        }
      });
    });

    describe('Deactivate user', () => {
      it('Deactivate testCarer02', async() => {
        let result = await adminModel.searchUsers('carer02');
        let userID = await result[0].id;
        let deactivated = await adminModel.deactivateUser(userID);
        if (deactivated) {
          let result = await dataModel.getHash('testCarer02');
          result.should.deep.equal(false);
        }
      });

      it('Deactivate testCarer04', async() => {
        let result = await adminModel.searchUsers('carer04');
        let userID = await result[0].id;
        let deactivated = await adminModel.deactivateUser(userID);
        if (deactivated) {
          let result = await dataModel.getHash('testCarer04');
          result.should.deep.equal(false);
        }
      });
    });
  });

  describe('Manage Residents', () => {
    describe('Search Residents', () => {
      it('Search all residents', async() => {
        let residents = await adminModel.searchResidents('');
        residents.should.have.lengthOf(12);
      });

      it('Should return 1 resident with name Curtis', async() => {
        let residents = await adminModel.searchResidents('Curtis');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Curtis');
      });

      it('Should return 1 resident with name Lionel', async() => {
        let residents = await adminModel.searchResidents('Lionel');
        residents.should.have.lengthOf(1);
        residents[0].forename.should.deep.equal('Lionel');
      });

      it('Should return 1 resident with name Odell Longshore', async() => {
        let residents = await adminModel.searchResidents('Odell Longshore');
        residents.should.have.lengthOf(1);
        residents[0].surname.should.deep.equal('Longshore');
      });

      it('Should return residents with forename or surname containing substring a', async() => {
        let residents = await adminModel.searchResidents('a');
        residents.should.have.lengthOf(7);
        residents[0].forename.should.deep.equal('Carmine');
        residents[6].forename.should.deep.equal('Ulysses');
      });

      it('Should return residents with forename or surname containing substring rm', async() => {
        let residents = await adminModel.searchResidents('rm');
        residents.should.have.lengthOf(2);
        residents[0].forename.should.deep.equal('Carmine');
        residents[1].forename.should.deep.equal('Royce');
      });
    });

    describe('Add residents. These tests also assess the order of the residents being returned', () => {
      it('Add a new resident, Jodie Sharp', async() => {
        let fname = 'Jodie';
        let sname = 'Sharp';
        let birthDate = '1930-02-03';
        let mvHandling = 'test2';
        let dietReq = 'example dietary requirements 1';
        let allergies = 'allergies 1';
        let thickener = 0;
        let diabetes = 0;
        let dnr = 1;
        let residents = await adminModel.addResident(fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr);
        residents.should.have.lengthOf(13);
        residents[6].forename.should.deep.equal(fname);
        residents[6].surname.should.deep.equal(sname);
        residents[6].dob.should.deep.equal(birthDate);
        residents[6].mvHandling.should.deep.equal(mvHandling);
        residents[6].dietReq.should.deep.equal(dietReq);
        residents[6].allergies.should.deep.equal(allergies);
        residents[6].thickener.should.deep.equal(thickener);
        residents[6].diabetes.should.deep.equal(diabetes);
        residents[6].dnr.should.deep.equal(dnr);
      });

      it('Add a new resident, Mary Wharton', async() => {
        let fname = 'Mary';
        let sname = 'Wharton';
        let birthDate = '1950-12-23';
        let mvHandling = 'test2';
        let dietReq = 'example dietary requirements 2';
        let allergies = 'allergies 2';
        let thickener = 1;
        let diabetes = 1;
        let dnr = 0;
        let residents = await adminModel.addResident(fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr);
        residents.should.have.lengthOf(14);
        residents[8].forename.should.deep.equal(fname);
        residents[8].surname.should.deep.equal(sname);
        residents[8].dob.should.deep.equal(birthDate);
        residents[8].mvHandling.should.deep.equal(mvHandling);
        residents[8].dietReq.should.deep.equal(dietReq);
        residents[8].allergies.should.deep.equal(allergies);
        residents[8].thickener.should.deep.equal(thickener);
        residents[8].diabetes.should.deep.equal(diabetes);
        residents[8].dnr.should.deep.equal(dnr);
      });

      it('Add a new resident, Rocky Shaw', async() => {
        let fname = 'Rocky';
        let sname = 'Shaw';
        let birthDate = '1945-12-13';
        let mvHandling = 'test3';
        let dietReq = 'example dietary requirements 3';
        let allergies = 'allergies 3';
        let thickener = 0;
        let diabetes = 2;
        let dnr = 1;
        let residents = await adminModel.addResident(fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr);
        residents.should.have.lengthOf(15);
        residents[11].forename.should.deep.equal(fname);
        residents[11].surname.should.deep.equal(sname);
        residents[11].dob.should.deep.equal(birthDate);
        residents[11].mvHandling.should.deep.equal(mvHandling);
        residents[11].dietReq.should.deep.equal(dietReq);
        residents[11].allergies.should.deep.equal(allergies);
        residents[11].thickener.should.deep.equal(thickener);
        residents[11].diabetes.should.deep.equal(diabetes);
        residents[11].dnr.should.deep.equal(dnr);
      });

      it('Add a new resident, Clive Cobb', async() => {
        let fname = 'Clive';
        let sname = 'Cobb';
        let birthDate = '1951-10-02';
        let mvHandling = 'test4';
        let dietReq = 'example dietary requirements 4';
        let allergies = 'allergies 4';
        let thickener = 1;
        let diabetes = 1;
        let dnr = 0;
        let residents = await adminModel.addResident(fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr);
        residents.should.have.lengthOf(16);
        residents[2].forename.should.deep.equal(fname);
        residents[2].surname.should.deep.equal(sname);
        residents[2].dob.should.deep.equal(birthDate);
        residents[2].mvHandling.should.deep.equal(mvHandling);
        residents[2].dietReq.should.deep.equal(dietReq);
        residents[2].allergies.should.deep.equal(allergies);
        residents[2].thickener.should.deep.equal(thickener);
        residents[2].diabetes.should.deep.equal(diabetes);
        residents[2].dnr.should.deep.equal(dnr);
      });
    });

    describe('Edit resident', () => {
      it('Amend the details of Rocky Shaw. Also test that current search is returned again', async() => {
        let search = await adminModel.searchResidents('Rocky Shaw');
        let resID = await search[0].id;

        let fname = 'Rocky';
        let sname = 'Shaw';
        let birthDate = '1945-12-13';
        let mvHandling = 'test3';
        let dietReq = 'amended dietary requirements';
        let allergies = 'amended allergies';
        let thickener = 1;
        let diabetes = 2;
        let dnr = 1;
        let currentSearch = 'sha';
        let residents = await adminModel.editResident(resID, fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr, currentSearch);
        residents[1].forename.should.deep.equal(fname);
        residents[1].surname.should.deep.equal(sname);
        residents[1].dob.should.deep.equal(birthDate);
        residents[1].mvHandling.should.deep.equal(mvHandling);
        residents[1].dietReq.should.deep.equal(dietReq);
        residents[1].allergies.should.deep.equal(allergies);
        residents[1].thickener.should.deep.equal(thickener);
        residents[1].diabetes.should.deep.equal(diabetes);
        residents[1].dnr.should.deep.equal(dnr);
        let testSearch = await adminModel.searchResidents(currentSearch);
        residents.should.deep.equal(testSearch);
      });

      it('Amend the details of Mary Wharton. Also test that current search is returned again', async() => {
        let search = await adminModel.searchResidents('Mary Wharton');
        let resID = await search[0].id;

        let fname = 'Mary';
        let sname = 'Wharton';
        let birthDate = '1950-12-23';
        let mvHandling = 'test2';
        let dietReq = 'example dietary requirements 2';
        let allergies = 'allergies 2';
        let thickener = 1;
        let diabetes = 1;
        let dnr = 0;
        let currentSearch = 'ma';
        let residents = await adminModel.editResident(resID, fname, sname, birthDate, mvHandling, dietReq, allergies, thickener, diabetes, dnr, currentSearch);
        residents[0].forename.should.deep.equal(fname);
        residents[0].surname.should.deep.equal(sname);
        residents[0].dob.should.deep.equal(birthDate);
        residents[0].mvHandling.should.deep.equal(mvHandling);
        residents[0].dietReq.should.deep.equal(dietReq);
        residents[0].allergies.should.deep.equal(allergies);
        residents[0].thickener.should.deep.equal(thickener);
        residents[0].diabetes.should.deep.equal(diabetes);
        residents[0].dnr.should.deep.equal(dnr);
        let testSearch = await adminModel.searchResidents(currentSearch);
        residents.should.deep.equal(testSearch);
      });
    });

    describe('Deactivate resident', () => {
      it('Deactivate a resident, Jodie Sharp. Also ensure that the deactivated residents are sorted last in the list', async() => {
        let residents = await adminModel.searchResidents('Jodie Sharp');
        let resID = await residents[0].id;
        let resDeactivated = await adminModel.deactivateResident(resID);
        resDeactivated[15].forename.should.deep.equal('Jodie');
        resDeactivated[15].surname.should.deep.equal('Sharp');
        resDeactivated[15].active.should.deep.equal(0);
      });

      it('Deactivate a resident, Clive Cobb. Also ensure that the deactivated residents are sorted last in the list', async() => {
        let residents = await adminModel.searchResidents('Clive Cobb');
        let resID = await residents[0].id;
        let resDeactivated = await adminModel.deactivateResident(resID);
        resDeactivated[14].forename.should.deep.equal('Clive');
        resDeactivated[14].surname.should.deep.equal('Cobb');
        resDeactivated[14].active.should.deep.equal(0);
      });
    });
  });

  describe('Manage Rooms', () => {
    describe('Search Rooms', () => {
      it('Search rooms with number including 2', async() => {
        let rooms = await adminModel.searchRooms('2');
        rooms.should.have.lengthOf(5);
        rooms[0].roomPrefix.should.deep.equal('A');
        rooms[0].roomNumber.should.deep.equal(2);
        rooms[0].names.should.deep.equal('Sylvester');

        rooms[1].roomPrefix.should.deep.equal('A');
        rooms[1].roomNumber.should.deep.equal(201);
        rooms[1].names.should.deep.equal('Refugio');

        rooms[2].roomPrefix.should.deep.equal('B');
        rooms[2].roomNumber.should.deep.equal(2);
        rooms[2].names.should.deep.equal('Del');

        rooms[3].roomPrefix.should.deep.equal('B');
        rooms[3].roomNumber.should.deep.equal(21);
        rooms[3].names.should.deep.equal('Ulysses');

        rooms[4].roomPrefix.should.deep.equal('C');
        rooms[4].roomNumber.should.deep.equal(200);
        rooms[4].names.should.deep.equal('Royce');
      });

      it('Search all rooms', async() => {
        let rooms = await adminModel.searchRooms('');
        rooms.should.have.lengthOf(13);
      });

      it('Search rooms with prefix including a', async() => {
        let rooms = await adminModel.searchRooms('a');
        rooms.should.have.lengthOf(5);
        rooms[0].roomPrefix.should.deep.equal('A');
        rooms[0].roomNumber.should.deep.equal(1);
        rooms[0].names.should.deep.equal('Hollis');

        rooms[1].roomPrefix.should.deep.equal('A');
        rooms[1].roomNumber.should.deep.equal(2);
        rooms[1].names.should.deep.equal('Sylvester');

        rooms[2].roomPrefix.should.deep.equal('A');
        rooms[2].roomNumber.should.deep.equal(3);
        rooms[2].names.should.deep.equal('Curtis');

        rooms[3].roomPrefix.should.deep.equal('A');
        rooms[3].roomNumber.should.deep.equal(4);
        rooms[3].names.should.deep.equal('Lionel');

        rooms[4].roomPrefix.should.deep.equal('A');
        rooms[4].roomNumber.should.deep.equal(201);
        rooms[4].names.should.deep.equal('Refugio');
      });
    });

    describe('Load residents from room', () => {
      it('Get residents from A1', async() => {
        let rooms = await adminModel.searchRooms('A1');
        let roomID = await rooms[0].id;
        let residents = await adminModel.loadRoomResidents(roomID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Hollis Happ');
      });

      it('Get residents from A2', async() => {
        let rooms = await adminModel.searchRooms('A2');
        let roomID = await rooms[0].id;
        let residents = await adminModel.loadRoomResidents(roomID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Sylvester Reynoso');
      });

      it('Get residents from B1', async() => {
        let rooms = await adminModel.searchRooms('B1');
        let roomID = await rooms[0].id;
        let residents = await adminModel.loadRoomResidents(roomID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Buck Brunet');
      });

      it('Get residents from B2', async() => {
        let rooms = await adminModel.searchRooms('B2');
        let roomID = await rooms[0].id;
        let residents = await adminModel.loadRoomResidents(roomID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Del Devine');
      });
    });

    describe('Add Room', () => {
      it('Add new room D1', async() => {
        let rooms = await adminModel.addRoom('D', 1);
        rooms.should.have.lengthOf(14);
        rooms[13].roomPrefix.should.deep.equal('D');
        rooms[13].roomNumber.should.deep.equal(1);
      });

      it('Add new room A23', async() => {
        let rooms = await adminModel.addRoom('A', 23);
        rooms.should.have.lengthOf(15);
        rooms[4].roomPrefix.should.deep.equal('A');
        rooms[4].roomNumber.should.deep.equal(23);
      });
    });

    describe('Edit Room', () => {
      it('Edit D1 to D101, also ensure that current search is returned', async() => {
        let result = await adminModel.searchRooms('D1');
        let roomID = await result[0].id;

        let currentSearch = 'd';
        let rooms = await adminModel.editRoom(roomID, 'D', 2, currentSearch);
        rooms[0].roomPrefix.should.deep.equal('D');
        rooms[0].roomNumber.should.deep.equal(2);

        let expectedSearch = await adminModel.searchRooms(currentSearch);
        rooms.should.deep.equal(expectedSearch);
      });

      it('Edit A23 to D23, also ensure that current search is returned', async() => {
        let result = await adminModel.searchRooms('A23');
        let roomID = await result[0].id;

        let currentSearch = '2';
        let rooms = await adminModel.editRoom(roomID, 'D', 23, currentSearch);
        rooms[6].roomPrefix.should.deep.equal('D');
        rooms[6].roomNumber.should.deep.equal(23);

        let expectedSearch = await adminModel.searchRooms(currentSearch);
        rooms.should.deep.equal(expectedSearch);
      });
    });

    describe('Get residents not in rooms', () => {
      it('Get residents not in rooms', async() => {
        let residents = await adminModel.availableResidents();
        residents.should.have.lengthOf(2);
        residents[0].resName.should.deep.equal('Mary Wharton');
        residents[1].resName.should.deep.equal('Rocky Shaw');
      });
    });

    describe('Assign resident to room', () => {
      it('Assign Mary Wharton to D2', async() => {
        let rooms = await adminModel.searchRooms('D2');
        let roomID = await rooms[0].id;

        let sRes = await adminModel.availableResidents();
        let resID = await sRes[0].id;
        let residents = await adminModel.assignResident(roomID, resID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Mary Wharton');
      });

      it('Assign Rocky Shaw to D3', async() => {
        let rooms = await adminModel.searchRooms('D23');
        let roomID = await rooms[0].id;

        let sRes = await adminModel.availableResidents();
        let resID = await sRes[0].id;
        let residents = await adminModel.assignResident(roomID, resID);
        residents.should.have.lengthOf(1);
        residents[0].resName.should.deep.equal('Rocky Shaw');
      });
    });

    describe('Unassign residents from room', () => {
      it('Remove Mary Wharton from D2', async() => {
        let rooms = await adminModel.searchRooms('D2');
        let roomID = await rooms[0].id;

        let sRes = await adminModel.loadRoomResidents(roomID);
        let resID = await sRes[0].id;
        let residents = await adminModel.unassignResident(roomID, resID);
        residents.should.have.lengthOf(0);
      });

      it('Remove Rocky Shaw from D3', async() => {
        let rooms = await adminModel.searchRooms('D23');
        let roomID = await rooms[0].id;

        let sRes = await adminModel.loadRoomResidents(roomID);
        let resID = await sRes[0].id;
        let residents = await adminModel.unassignResident(roomID, resID);
        residents.should.have.lengthOf(0);
      });
    });
  });
});
