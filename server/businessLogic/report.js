const express = require('express');
const data = require('../persistence/persist_main.js');
const reportData = require('../persistence/persist_report.js');

const reportApp = express.Router();

//For every request made to the report URL, this middleware checks that the user has report permission
reportApp.use(async (req, res, next) => {
  const userID = req.decoded.id;
  const auth = await data.isAuthorised(userID, 6);

  //If the user is authorised, fulfil their request. Otherwise notify the user that they are not permitted.
  if(auth) {
    next();
  }
  else {
    return res.status(403).send('You do not have permission to view reports');
  }
});

//Retrieves contact sheets from persistence. Filters the contact sheets by criteria entered by the user.
reportApp.get('/contact', async (req, res) => {
  //Search criteria is taken from the request
  const userFilter = req.query.userFilter;
  const resFilter = req.query.resFilter;
  const afterDate = req.query.afterDate;
  const afterTime = req.query.afterTime;
  const beforeDate = req.query.beforeDate;
  const beforeTime = req.query.beforeTime;
  const drinkGiven = req.query.drinkGiven;
  const moodFilter = req.query.moodFilter;
  const orderBy = req.query.orderBy;

  try {
    const contact = await reportData.getContact(userFilter, resFilter, afterDate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
    console.log(contact);
    return res.status(200).json({ contact: contact });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

//Exports this API as a middleware for the server
module.exports = reportApp;
