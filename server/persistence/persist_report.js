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

//Retrieves all contact sheet entries meeting the search criteria, building a customised query based on the user's chosen filters
async function getContact(userFilter, resFilter, afterDate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy) {
  //main part of SQL query is written here
  let queryString = 'SELECT U.username, DATE_FORMAT(DATE(C.contactDate), "%d/%m/%Y") as contactDate, DATE_FORMAT(TIME(C.contactDate), "%H:%i") as contactTime, C.callBell, C.drinkGiven, C.description, C.mood, CONCAT(CONCAT(R.forename, " "), R.surname) AS resName FROM Contact C INNER JOIN User U ON U.id = C.userID INNER JOIN Resident R ON R.id = C.resID';
  

  //Filters by username of user who added the entry. If not provided, returns contact from all users
  userFilter = '%' + userFilter + '%';
  queryString += ' WHERE U.username LIKE ?';

  //Filters by resident's forename, surname or forname and surname together, based on string entered in report search
  resFilter = '%' + resFilter + '%';
  queryString += ' AND (R.forename LIKE ? OR R.surname LIKE ? OR CONCAT(CONCAT(R.forename, " "), R.surname) LIKE ?)';

  //Filter contact sheets whose dates fall between the given start and end dates from the report search.
  //Dates and times are combined to in format which can be queried as DateTime values
  let startDatetime = afterDate + ' ' + afterTime;
  let endDatetime = beforeDate + ' ' + beforeTime;
  queryString += ' AND (C.contactDate BETWEEN ? AND ?)';

  //Filters by mood recorded in the contact entry. If not provided, will return contact with any values for the mood field.
  moodFilter = '%' + moodFilter + '%';
  queryString += ' AND C.mood LIKE ?';

  //Filters for contact search are added to an array in order, to replace the ?s when the query is prepared
  let values = [userFilter, resFilter, resFilter, resFilter, startDatetime, endDatetime, moodFilter];

  if(drinkGiven === 'true') {
    queryString += ' AND C.drinkGiven = 1';
  }

  //Add selected ordering and semicolon to end of created SQL statement
  let orderStrings = ['C.contactDate ASC', 'C.contactDate DESC', 'resName ASC', 'resName DESC', 'U.username ASC', 'U.username DESC'];
  queryString += ' ORDER BY ' + orderStrings[orderBy] + ';';

  const sql = await init();
  //The query is formatted and prepared with the search values, to prevent SQL injection
  const query = sql.format(queryString, values);
  
  const [rows] = await sql.query(query);
  return (rows);
}



module.exports.getContact = getContact;