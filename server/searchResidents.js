const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');

const router = express.Router();

router.get('/', async (req, res) => {
  //Take username from decoded JWT access token
  const username = req.decoded.username;
  const filter = req.query.filter;
  const userID = req.decoded.id;

  try {
    const residents = await data.getResidents(filter);
    const adminAccess = await data.isAuthorised(userID, 5);
    const reportAccess = await data.isAuthorised(userID, 6);
    
    //Sends array of residents with info. Also sends username back to be added to navbar (when user is already logged in but refreshes the page).
    //Sends success which can be checked by client.
    res.status(200).json({ residents: residents, username: username, admin: adminAccess, report: reportAccess });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
