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

//Retrieve hashed password associated with a username, to later authenticate against entered password during login attempt.
async function getHash(username) {
  const sql = await init();
  const query = sql.format('SELECT id, password FROM User WHERE username = ? AND active = 1', [username]);
  const [rows] = await sql.query(query);
  return (rows[0] === undefined ? false : rows[0]);
}

//Retrieve all residents with their information from the database. Filters on name or room number to easily find residents.
async function getResidents(search) {
  const filter = '%' + search + '%';
  const sql = await init();
  const query = sql.format('SELECT X.id, X.forename, X.surname, X.dietReq, X.allergies, X.thickener, X.diabetes, X.dnr, CONCAT(Y.roomPrefix, Y.roomNumber) AS roomName FROM Resident X JOIN Room Y ON Y.id = X.roomID WHERE X.active = 1 AND (X.forename LIKE ? OR X.surname LIKE ? OR CONCAT(CONCAT(X.forename, " "), X.surname) LIKE ? OR Y.roomNumber LIKE ? OR Y.roomPrefix LIKE ? OR CONCAT(Y.roomPrefix, Y.roomNumber) LIKE ?) ORDER BY Y.roomPrefix, Y.roomNumber ASC', [filter, filter, filter, filter, filter, filter]);
  const [rows] = await sql.query(query);
  return (rows);
}

//Retrieves all contact sheet entries from the last 24hrs for a given resident.
async function searchContact(resID) {
  const sql = await init();
  const query = sql.format('SELECT U.username, DATE_FORMAT(DATE(C.contactDate), "%d/%m/%Y") as contactDate, DATE_FORMAT(TIME(C.contactDate), "%H:%i") as contactTime, C.callBell, C.drinkGiven, C.description, C.mood FROM Contact C LEFT JOIN User U ON U.id = C.userID WHERE C.resID = ? AND C.contactDate >= NOW() - INTERVAL 1 DAY ORDER BY C.contactDate DESC, C.id DESC', [resID]);
  const [rows] = await sql.query(query);
  return (rows);
}

//Retrieves the newest contact sheet entry to show the user that they have saved it
async function getNewContact(resID) {
  const sql = await init();
  const query = sql.format('SELECT U.username, DATE_FORMAT(DATE(C.contactDate), "%d/%m/%Y") as contactDate, DATE_FORMAT(TIME(C.contactDate), "%H:%i") as contactTime, C.callBell, C.drinkGiven, C.description, C.mood FROM Contact C LEFT JOIN User U ON U.id = C.userID WHERE C.resID = ? ORDER BY C.contactDate DESC, C.id DESC LIMIT 1', [resID]);
  const [rows] = await sql.query(query);
  return (rows)[0];
}

//Saves a new contact sheet entry
async function insertContact(resID, userID, callBell, drinkGiven, description, mood) {
  const sql = await init();

  //Uses NOW for contactDate instead of user entered information to avoid fabricated times/entries
  const query = sql.format('INSERT INTO Contact (resID, userID, contactDate, callBell, drinkGiven, description, mood) VALUES (?, ?, NOW(), ?, ?, ?, ?)', [resID, userID, callBell, drinkGiven, description, mood]);
  return (await sql.query(query));
}

async function isAuthorised(userID, type) {
  const sql = await init();

  //Joins permissions and UserPermission as it needs to check userID from UserPermission and type from permissions table.
  const query = sql.format('SELECT Y.type, X.userID FROM UserPermission X JOIN Permission Y ON X.pmsnID = Y.id WHERE X.userID = ? AND Y.type = ?', [userID, type]);
  const [rows] = await sql.query(query);
  //empty array from query implies user has not been granted the permission, returns false
  //returns true if permission is found for the user
  return (Boolean(rows.length));
}

module.exports = {
  getHash: getHash,
  getResidents: getResidents,
  searchContact: searchContact,
  getNewContact: getNewContact,
  insertContact: insertContact,
  isAuthorised: isAuthorised
};
