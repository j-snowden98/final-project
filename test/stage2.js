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
          console.log(password);
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
          console.log(password);
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
