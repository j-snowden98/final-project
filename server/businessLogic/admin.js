const express = require('express');
const manageResident = require('./manageResident.js');
const manageUser = require('./manageUser.js');
const manageRoom = require('./manageRoom.js');
const data = require('../persistence/persist_main.js');

const adminApp = express.Router();

adminApp.use(async (req, res, next) => {
  try {
    const userID = req.decoded.id;
    const auth = await data.isAuthorised(userID, 5);

    if(auth) {
      next();
    }
    else {
      return res.status(403).send('You do not have permission to perform this action');
    }
  }
  catch (e) {
    //Notifies user of an error with the server
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

adminApp.use('/resident', manageResident);
adminApp.use('/user', manageUser);
adminApp.use('/room', manageRoom);

module.exports = adminApp;
