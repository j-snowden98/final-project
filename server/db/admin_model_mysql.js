'use strict';
const mysql = require('mysql2/promise');
const config = require('./../../admin_config.json');

let sqlPromise = null;
async function init() {
  //returns a new connection if one is not available
  if (sqlPromise) return sqlPromise;
  sqlPromise = newConnection();
  return sqlPromise;
}

async function newConnection() {
  //creates a new connection to the database using credentials in config file
  const sql = await mysql.createConnection(config.mysql);

  //sql connection will terminate on error and report it to the console
  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });
  return sql;
}

async function releaseConnection(connection) {
  //releases the resources after a function is finished using it
  await connection.end();
}


//User Management Functionality
//-----------------------------------

async function addUser(username, password, role, permissions) {
  //insert a new user into the database
  const sql = await init();
  const query = sql.format('INSERT INTO User SET ? ;', {
    username: username,
    password: password,
    role: role,
  });

  //Get the last inserted ID of the new user
  const result = await sql.query(query);
  const resultInfo = await result[0];
  const userID = await resultInfo.insertId;

  //Set permissions of new user using their ID
  const permissionsSet = await setPermissions(userID, permissions);
  //Once their permissions have been set, return the new user to be shown in the webpage.
  if (await permissionsSet) {
    return await getUser(userID);
  }
}

async function searchUsers(search) {
  const sql = await init();
  const filter = '%' + search + '%';
  const query = sql.format('SELECT id, username, role FROM User WHERE username LIKE ? OR role LIKE ? ORDER BY username ASC', [filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
}

async function getUser(userID) {
  const sql = await init();
  const query = sql.format('SELECT id, username, role FROM User WHERE id = ?', [userID]);
  const [rows] = await sql.query(query);
  return (rows)[0];
}

async function editUser(userID, username, role) {
  //Edit a user's username and role
  const sql = await init();
  const userQuery = sql.format('UPDATE User SET username = ?, role = ? WHERE id = ?;', [username, role, userID]);
  return await sql.query(userQuery);
}

async function setPermissions(userID, permissions) {
  const sql = await newConnection();
  let success = await sql.query('DELETE FROM UserPermissions WHERE userID = ?', [userID]);
  if (await success) {
    for(let p of permissions) {
      await sql.query('INSERT INTO UserPermissions (userID, pmsnID) VALUES (?, ?)', [userID, p]);
    }

    releaseConnection(sql);
    return true;
  }
};

async function getPermissions(userID) {
  const sql = await init();
  const query = sql.format('SELECT P.id, P.name, P.type, U.userID FROM Permissions P LEFT JOIN (SELECT userID, pmsnID FROM UserPermissions WHERE userID = ?) U ON P.id = U.pmsnID ORDER BY P.type ASC', [userID]);
  const [rows] = await sql.query(query);
  return rows;
}

async function resetPassword(userID, newPassword) {
  //Change a user's password
  const sql = await init();
  const userQuery = sql.format('UPDATE User SET password = ? WHERE id = ?;', [newPassword, userID]);
  return await sql.query(userQuery);
}

async function deactivate(userID) {
  const sql = await init();
  const query = sql.format('UPDATE User SET active = 0 WHERE id = ?;', [userID]);
  return await sql.query(query);
}

//Room Management Functionality
//------------------------------------

async function searchRooms(search) {
  const filter = '%' + search + '%';
  const sql = await init();
  const query = sql.format('SELECT RM.id, RM.roomPrefix, RM.roomNumber, RE.names FROM Room RM LEFT JOIN (SELECT GROUP_CONCAT(DISTINCT Y.Forename ORDER BY Y.Forename ASC SEPARATOR \',\') AS names, X.roomID FROM ResidentRoom X INNER JOIN Resident Y ON X.resID = Y.id GROUP BY X.roomID) RE ON RE.roomID = RM.id WHERE RM.roomNumber LIKE ? OR RM.roomPrefix LIKE ? OR CONCAT(RM.roomPrefix, RM.roomNumber) LIKE ? ORDER BY RM.roomPrefix, RM.roomNumber ASC', [filter, filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
}

async function loadRoomResidents(roomID) {
  const sql = await init();
  const query = sql.format('SELECT Y.id, CONCAT(CONCAT(Y.forename, " "), Y.surname) AS resName FROM ResidentRoom X INNER JOIN Resident Y ON X.resID = Y.id WHERE X.roomID = ? ORDER BY Y.forename, Y.surname ASC', [roomID]);
  const [rows] = await sql.query(query);
  return rows;
}

async function addRoom(prefix, number) {
  //insert a new user into the database
  const sql = await init();
  const query = sql.format('INSERT INTO Room SET ? ;', {
    roomPrefix: prefix,
    roomNumber: number
  });

  const result = await sql.query(query);
  if (await result) {
    return await searchRooms('');
  }
}

module.exports = {
  addUser: addUser,
  searchUsers: searchUsers,
  editUser: editUser,
  getUser: getUser,
  getPermissions: getPermissions,
  setPermissions: setPermissions,
  resetPassword: resetPassword,
  deactivate: deactivate,
  searchRooms: searchRooms,
  loadRoomResidents: loadRoomResidents,
  addRoom: addRoom
};
