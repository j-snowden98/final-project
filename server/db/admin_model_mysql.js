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
    return await searchUsers('');
  }
}

async function searchUsers(search) {
  const sql = await init();
  const filter = '%' + search + '%';
  const query = sql.format('SELECT id, username, role FROM User WHERE active = 1 AND (username LIKE ? OR role LIKE ?) ORDER BY username ASC', [filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
}

async function editUser(userID, username, role, currentSearch) {
  //Edit a user's username and role
  const sql = await init();
  const query = sql.format('UPDATE User SET username = ?, role = ? WHERE id = ?;', [username, role, userID]);

  const result = await sql.query(query);
  if (await result) {
    return await searchUsers(currentSearch);
  }
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

async function deactivateUser(userID) {
  const sql = await init();
  const query = sql.format('UPDATE User SET active = 0 WHERE id = ?;', [userID]);
  const result = await sql.query(query);
  if (await result) {
    return await searchUsers('');
  }
}



//Room Management Functionality
//------------------------------------

async function searchRooms(search) {
  const filter = '%' + search + '%';
  const sql = await init();
  const query = sql.format('SELECT RM.id, RM.roomPrefix, RM.roomNumber, RE.names FROM Room RM LEFT JOIN (SELECT GROUP_CONCAT(DISTINCT Forename ORDER BY Forename ASC SEPARATOR \', \') AS names, roomID FROM Resident GROUP BY roomID) RE ON RE.roomID = RM.id WHERE RM.roomNumber LIKE ? OR RM.roomPrefix LIKE ? OR CONCAT(RM.roomPrefix, RM.roomNumber) LIKE ? ORDER BY RM.roomPrefix, RM.roomNumber ASC', [filter, filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
}

async function loadRoomResidents(roomID) {
  const sql = await init();
  const query = sql.format('SELECT id, CONCAT(CONCAT(forename, " "), surname) AS resName FROM Resident WHERE roomID = ? ORDER BY forename, surname ASC', [roomID]);
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

async function editRoom(roomID, prefix, number, currentSearch) {
  //Edit a room's prefix and number
  const sql = await init();
  const query = sql.format('UPDATE Room SET roomPrefix = ?, roomNumber = ? WHERE id = ?;', [prefix, number, roomID]);
  const result = await sql.query(query);

  //Once query has been executed, will refresh the search of rooms
  if (await result) {
    return await searchRooms(currentSearch);
  }
}

async function unassignResident(roomID, resID) {
  const sql = await init();
  const query = sql.format('UPDATE Resident SET roomID = NULL WHERE id = ?;', [resID]);
  const result = await sql.query(query);

  //Refreshes the list of residents in that room once the resident has been removed
  if(await result) {
    return await loadRoomResidents(roomID);
  }
}

async function availableResidents() {
  //Return all residents not assigned to rooms in alphabetical order of their names.
  const sql = await init();
  const query = sql.format('SELECT id, CONCAT(CONCAT(forename, " "), surname) AS resName FROM Resident WHERE roomID IS NULL AND active = 1 ORDER BY forename, surname ASC');
  const [rows] = await sql.query(query);
  return rows;
}

async function assignResident(roomID, resID) {
  const sql = await init();
  const query = sql.format('UPDATE Resident SET roomID = ? WHERE id = ?;', [roomID, resID]);
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
  const query = sql.format('SELECT X.id, X.forename, X.surname, X.dietReq, X.allergies, X.thickener, X.diabetes, X.dnr, X.active FROM Resident X WHERE X.forename LIKE ? OR X.surname LIKE ? OR CONCAT(CONCAT(X.forename, " "), X.surname) LIKE ? ORDER BY X.active DESC, X.forename, X.surname ASC LIMIT 60', [filter, filter, filter]);
  const [rows] = await sql.query(query);
  return rows;
}

async function addResident(forename, surname, dietReq, allergies, thickener, diabetes, dnr) {
  //Add a new resident to the database
  const sql = await init();
  const query = sql.format('INSERT INTO Resident SET ? ;', {
    forename: forename,
    surname: surname,
    dietReq: dietReq,
    allergies: allergies,
    thickener: thickener,
    diabetes: diabetes,
    dnr: dnr
  });
  const result = await sql.query(query);

  //Once query has been executed, will get updated list of residents
  if (await result) {
    return await searchResidents('');
  }
}

async function deactivateResident(resID) {
  //Deactivates a resident. They will not show up on most searches, but their details and related contact are retained.
  const sql = await init();
  const query = sql.format('UPDATE Resident SET active = 0 WHERE id = ?;', [resID]);
  const result = await sql.query(query);

  //Once query has been executed, will refresh the list of residents
  if (await result) {
    return await searchResidents('');
  }
}

async function editResident(resID, forename, surname, dietReq, allergies, thickener, diabetes, dnr, currentSearch) {
  //Saves amendments to a resident's details
  const sql = await init();
  const query = sql.format('UPDATE Resident SET ? WHERE id = ?;', [{
    forename: forename,
    surname: surname,
    dietReq: dietReq,
    allergies: allergies,
    thickener: thickener,
    diabetes: diabetes,
    dnr: dnr
  }, resID]);
  const result = await sql.query(query);

  //Once query has been executed, will refresh the search of rooms
  if (await result) {
    return await searchResidents(currentSearch);
  }
}

module.exports = {
  addUser: addUser,
  searchUsers: searchUsers,
  editUser: editUser,
  getPermissions: getPermissions,
  setPermissions: setPermissions,
  resetPassword: resetPassword,
  deactivateUser: deactivateUser,
  searchRooms: searchRooms,
  loadRoomResidents: loadRoomResidents,
  addRoom: addRoom,
  editRoom: editRoom,
  unassignResident: unassignResident,
  availableResidents: availableResidents,
  assignResident: assignResident,
  searchResidents: searchResidents,
  addResident: addResident,
  deactivateResident: deactivateResident,
  editResident: editResident
};
