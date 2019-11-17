'use strict';
const mysql = require('mysql2/promise');
const config = require('./../../config.json');

let sqlPromise = null;
async function init() {
  if (sqlPromise) return sqlPromise;
  sqlPromise = newConnection();
  return sqlPromise;
}

async function newConnection() {
  const sql = await mysql.createConnection(config.mysql);
  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });
  return sql;
}

async function releaseConnection(connection) {
  await connection.end();
}

async function addUser(username, password, role) {
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
  const query = sql.format('SELECT X.id, X.forename, X.surname, X.dietReq, X.allergies, X.thickener, Z.roomName FROM Resident X JOIN ResidentRoom Y ON X.id = Y.resID JOIN Room Z on Y.roomID = Z.id WHERE X.forename LIKE ? OR X.surname LIKE ? OR Z.roomName LIKE ?', [filter, filter, filter]);
  const [rows] = await sql.query(query);
  console.log(rows);
  return (rows);
}

async function insertContact(resID, userID, callBell, drinkGiven, description) {
  const sql = await init();
  const query = sql.format('INSERT INTO Contact (resID, userID, contactDate, contactTime, callBell, drinkGiven, description) VALUES (?, ?, DATE(NOW()), TIME(NOW()), ?, ?, ?)', [resID, userID, callBell, drinkGiven, description]);
  return (await sql.query(query));
}

module.exports = {
  addUser: addUser,
  getHash: getHash,
  getResidents: getResidents,
  insertContact: insertContact
};
