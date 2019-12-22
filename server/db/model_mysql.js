'use strict';
const mysql = require('mysql2/promise');
const config = require('./../../config.json');

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
  //sql will terminate on error and report it to the console
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

async function addUser(username, password, role) {
  //insert a new user into the database
  const sql = await init();
  const userQuery = sql.format('INSERT INTO User SET ? ;', {
    username: username,
    password: password,
    role: role,
  });
  await sql.query(userQuery);
}

//Retrieve hashed password associated with a username, to later authenticate against entered password during login attempt.
async function getHash(username) {
  const sql = await init();
  const query = sql.format('SELECT id, password FROM User WHERE username = ?', [username]);
  const [rows] = await sql.query(query);
  console.log(rows);
  return (rows)[0];
}

//Retrieve all residents with their information from the database. Filters on name or room number to easily find residents.
async function getResidents(search) {
  const filter = '%' + search + '%';
  const sql = await init();
  const query = sql.format('SELECT X.id, X.forename, X.surname, X.dietReq, X.allergies, X.thickener, CONCAT(Z.roomPrefix, Z.roomNumber) AS roomName FROM Resident X JOIN ResidentRoom Y ON X.id = Y.resID JOIN Room Z ON Y.roomID = Z.id WHERE X.forename LIKE ? OR X.surname LIKE ? OR Z.roomNumber LIKE ? OR Z.roomPrefix LIKE ? ORDER BY Z.roomPrefix, Z.roomNumber ASC', [filter, filter, filter, filter]);
  const [rows] = await sql.query(query);
  console.log(rows);
  return (rows);
}

async function searchContact(resID) {
  const sql = await init();
  const query = sql.format('SELECT U.username, C.contactDate, C.contactTime, C.callBell, C.drinkGiven, C.description FROM Contact C LEFT JOIN User U ON U.id = C.userID WHERE C.resID = ? AND C.contactDate >= CURDATE() - INTERVAL 1 DAY ORDER BY C.contactDate, C.contactTime DESC', [resID]);
  const [rows] = await sql.query(query);
  return (rows);
}

async function insertContact(resID, userID, callBell, drinkGiven, description) {
  const sql = await init();
  const query = sql.format('INSERT INTO Contact (resID, userID, contactDate, contactTime, callBell, drinkGiven, description) VALUES (?, ?, DATE(NOW()), TIME(NOW()), ?, ?, ?)', [resID, userID, callBell, drinkGiven, description]);
  return (await sql.query(query));
}

async function isAuthorised(userID, type) {
  const sql = await init();

  //Joins permissions and UserPermissions as it needs to check userID from UserPermissions and type from permissions table.
  const query = sql.format('SELECT Y.type, X.userID FROM UserPermissions X JOIN Permissions Y ON X.pmsnID = Y.id WHERE X.userID = ? AND Y.type = ?', [userID, type]);
  const [rows] = await sql.query(query);
  //empty array from query implies user has not been granted the permission, returns false
  //returns true if permission is found for the user
  return (Boolean(rows.length));
}

module.exports = {
  addUser: addUser,
  getHash: getHash,
  getResidents: getResidents,
  searchContact: searchContact,
  insertContact: insertContact,
  isAuthorised: isAuthorised
};
