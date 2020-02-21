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
  const query = sql.format('SELECT P.id, P.name, P.type, U.userID FROM Permissions P LEFT JOIN UserPermissions U ON P.id = U.pmsnID AND U.userID = ? ORDER BY P.type ASC', [userID]);
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
  const query = sql.format('SELECT RM.id, RM.roomPrefix, RM.roomNumber, RE.names FROM Room RM LEFT JOIN (SELECT GROUP_CONCAT(DISTINCT Y.Forename ORDER BY Y.Forename ASC SEPARATOR \', \') AS names, X.roomID FROM ResidentRoom X INNER JOIN Resident Y ON X.resID = Y.id GROUP BY X.roomID) RE ON RE.roomID = RM.id WHERE RM.roomNumber LIKE ? OR RM.roomPrefix LIKE ? OR CONCAT(RM.roomPrefix, RM.roomNumber) LIKE ? ORDER BY RM.roomPrefix, RM.roomNumber ASC', [filter, filter, filter]);
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
  //Add a new room to the database
  const sql = await init();
  const query = sql.format('INSERT INTO Room SET ? ;', {
    roomPrefix: prefix,
    roomNumber: number
  });
  const result = await sql.query(query);

  //Once query has been executed, will refresh the search of rooms
  if (await result) {
    return await searchRooms('');
  }
}

async function editRoom(roomID, prefix, number) {
  //Edit a room's prefix and number
  const sql = await init();
  const query = sql.format('UPDATE Room SET roomPrefix = ?, roomNumber = ? WHERE id = ?;', [prefix, number, roomID]);
  const result = await sql.query(query);

  //Once query has been executed, will refresh the search of rooms
  if (await result) {
    return await searchRooms('');
  }
}

async function unassignResident(roomID, resID) {
  const sql = await init();
  const query = sql.format('DELETE FROM ResidentRoom WHERE roomID = ? AND resID = ?;', [roomID, resID]);
  const result = await sql.query(query);

  //Refreshes the list of residents in that room once the resident has been removed
  if(await result) {
    return await loadRoomResidents(roomID);
  }
}

async function availableResidents() {
  //Return all residents not assigned to rooms in alphabetical order of their names.
  const sql = await init();
  const query = sql.format('SELECT X.id, CONCAT(CONCAT(X.forename, " "), X.surname) AS resName FROM Resident X LEFT JOIN ResidentRoom Y ON Y.resID = X.id WHERE Y.roomID IS NULL ORDER BY X.forename, X.surname ASC');
  const [rows] = await sql.query(query);
  return rows;
}

async function assignResident(roomID, resID) {
  const sql = await init();
  const query = sql.format('INSERT INTO ResidentRoom SET ? ;', {
    roomID: roomID,
    resID: resID
  });
  const result = await sql.query(query);
  if(await result) {
    return await loadRoomResidents(roomID);
  }
}


//Resident Management Functionality
//------------------------------------

async function searchResidents(search) {
  const filter = '%' + search + '%';
  const sql = await init();

  //This returns all residents matching the search, by forename, surname or forname and surname.
  //Maximun of 60 rows as there will be inactive residents as well which would result a lot of data in the response.
  const query = sql.format('SELECT X.id, X.forename, X.surname, X.dietReq, X.allergies, X.thickener, X.diabetes, X.dnr FROM Resident X WHERE X.forename LIKE ? OR X.surname LIKE ? OR CONCAT(CONCAT(X.forename, " "), X.surname) LIKE ? ORDER BY X.active DESC, X.forename, X.surname ASC LIMIT 60', [filter, filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
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
  addRoom: addRoom,
  editRoom: editRoom,
  unassignResident: unassignResident,
  availableResidents: availableResidents,
  assignResident: assignResident,
  searchResidents: searchResidents,
};
