'use strict';
const mysql = require('mysql2/promise');
const config = require('../../config.json');

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

//Retrieves all contact sheet entries from the last 24hrs for a given resident.
async function getReport(user, resident, afterDate, beforeDate, drinkGiven, mood) {
  let queryString = 'SELECT U.username, DATE_FORMAT(DATE(C.contactDate), "%d/%m/%Y") as contactDate, DATE_FORMAT(TIME(C.contactDate), "%H:%i") as contactTime, C.callBell, C.drinkGiven, C.description, C.mood FROM Contact C LEFT JOIN User U ON U.id = C.userID';
  let values = [];
  let filterAdded = false;

  if(user !== null && user !== ''){
    user = '%' + user + '%';
    queryString += `${!filterAdded ? ' WHERE' : ' AND'} U.username LIKE ?`;
    values.push(user);
    filterAdded = true;
  }

  const sql = await init();
  const query = sql.format(queryString, [resID]);
  const [rows] = await sql.query(query);
  return (rows);
}



module.exports.getReport = getReport;