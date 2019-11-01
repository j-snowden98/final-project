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

async function getHash(username) {
  const sql = await init();
  const query = sql.format('SELECT id, password FROM User WHERE username = ?', [username]);
  const [rows] = await sql.query(query);
  console.log(rows);
  return (rows)[0];
}

module.exports = {
  addUser: addUser,
  getHash: getHash
};
