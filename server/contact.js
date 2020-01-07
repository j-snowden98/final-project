const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/add', async (req, res) => {
  //Take user id from JWT token
  const userID = req.decoded.id;
  try {
    //Check that user has permission to add contact sheets
    const auth = await data.isAuthorised(userID, 3);
    if(auth) {
      try {
        const resID = req.body.resID;
        const callBell = req.body.callBell;
        const drinkGiven = req.body.drinkGiven;
        const description = req.body.description;
        
        //Use db model to save new record into database
        const result = await data.insertContact(resID, userID, callBell, drinkGiven, description);

        //Retrieve the newly added contact entry to be sent back to user
        //Gives feedback to show the user that they have successfully added an entry
        let newEntry = await data.getNewContact(resID);
        return res.status(200).json({ new: newEntry });
      }
      catch (e) {
        //Notifies user of an error with the server
        return res.status(500).send('Server error!');
        console.log(e);
      }
    }
    else {
      //Notifies user that they do not have permission to add a contact sheet.
      return res.status(403).send('You do not have permission to perform this action');
    }
  }
  catch (e) {
    //Notifies user of an error with the server
    return res.status(500).send('Server error!');
    console.log(e);
  }
});

router.get('/load', async (req, res) => {
  //Take user id from JWT token
  const userID = req.decoded.id;
  const resID = req.query.resID;
  try {
    //Check that user has permission to view contact sheets
    const auth = await data.isAuthorised(userID, 1);
    if(auth) {
      try {
        let resContact = await data.searchContact(resID);
        return res.status(200).json({ contact: resContact });
      }
      catch (e) {
        //Notifies user of an error with the server
        return res.status(500).send('Server error!' + '\n' + e);
      }
    }
    else {
      //Notifies user that they do not have permission to view contact sheets.
      return res.status(403).send('You do not have permission to perform this action');
    }
  }
  catch (e) {
    //Notifies user of an error with the server
    return res.status(500).send('Server error!' + '\n' + e);
  }
});

module.exports = router;
