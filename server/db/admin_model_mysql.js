'use strict';
const mysql = require('mysql2/promise');
const config = require('./../../config_admin.json');

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

async function editUser(userID, username, role) {
  //Edit a user's username and role
  const sql = await init();
  const userQuery = sql.format('UPDATE User SET username = ?, role = ? WHERE id = ?;', [username, role, userID]);
  await sql.query(userQuery);
}

async function resetPassword(userID, newPassword) {
  //Change a user's password
  const sql = await init();
  const userQuery = sql.format('UPDATE User SET password = ? WHERE id = ?;', [newPassword, userID]);
  await sql.query(userQuery);
}

module.exports = {
  addUser: addUser,
  editUser: editUser,
  resetPassword: resetPassword
};
