const express = require('express');
const data = require('./db/model_mysql.js');
const reportData = require('./db/model_mysql.js');

const adminApp = express.Router();

adminApp.use(async (req, res, next) => {
  const userID = req.decoded.id;
  const auth = await data.isAuthorised(userID, 6);

  if(auth) {
    next();
  }
  else {
    return res.status(403).send('You do not have permission to view reports');
  }
});

adminApp.get();

module.exports = adminApp;
