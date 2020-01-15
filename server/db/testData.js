const mysql = require('mysql2/promise');
const config = require('./../../config.json');

//Code for handling database connections
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


//Code to prepare database for testing
async function prepareDatabase() {
  let done = await clearDatabase();
  if(done)
    insertResidents();
}

async function clearDatabase() {
  const sql = await init();
  const query = sql.format('DELETE FROM Resident WHERE id > 0;');
  return (await sql.query(query));
}
 //DELETE FROM Room WHERE id > 0; DELETE FROM ResidentRoom WHERE id > 0; DELETE FROM Contact WHERE id > 0;

async function insertResidents() {
  const sql = await init();
  const query = sql.format("INSERT INTO Resident (forename, surname, dietReq, allergies, thickener, diabetes, dnr) VALUES ('Lionel', 'Lundstrom', '', '', true, 2, true), ('Del', 'Devine', '', '', false, 0, true), ('Hollis', 'Happ', '', '', false, 1, false), ('Odell', 'Longshore', '', '', true, 2, false), ('Royce', 'Oberman', '', '', true, 0, false), ('Refugio', 'Chausse', '', '', false, 2, true), ('Sylvester', 'Reynoso', '', '', false, 2, true), ('Curtis', 'Calcagno', '', '', false, 1, true), ('Buck', 'Brunet', '', '', true, 2, true), ('Ulysses', 'Umstead', '', '', false, 1, true), ('Carmine', 'Christianson', '', '', false, 0, true), ('Ivan', 'Ippolito', '', '', true, 0, true); INSERT INTO st_ronans_care.Room (roomPrefix, roomNumber) VALUES ('A', 1), ('A', 2), ('A', 3), ('A', 4), ('A', 201), ('B', 1), ('B', 2), ('B', 3), ('B', 21), ('B', 5), ('C', 1), ('C', 3), ('C', 200);");
  return (await sql.query(query));
}

prepareDatabase();

module.exports = {
  prepareDatabase: prepareDatabase
};
