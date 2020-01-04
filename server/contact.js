const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const jwt = require('jsonwebtoken');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/add', async (req, res) => {
  const userID = req.decoded.id;
  try {
    const auth = await data.isAuthorised(userID, 3);
    if(auth) {
      try {
        const resID = req.body.resID;
        const callBell = req.body.callBell;
        const drinkGiven = req.body.drinkGiven;
        const description = req.body.description;
        const result = await data.insertContact(resID, userID, callBell, drinkGiven, description);
        console.log(result);
        let newEntry = await data.getNewContact(resID);
        return res.status(200).json({ success: true, new: newEntry });
      }
      catch (e) {
        return res.status(500).send('Server error!');
        console.log(e);
      }
    }
    else {
      return res.status(403).json({success: false, message: 'You do not have permission to perform this action'});
    }
  }
  catch (e) {
    return res.status(500).send('Server error!');
    console.log(e);
  }
});

router.get('/load', async (req, res) => {
  const userID = req.decoded.id;
  const resID = req.query.resID;
  try {
    const auth = await data.isAuthorised(userID, 1);
    if(auth) {
      try {
        let resContact = await data.searchContact(resID);
        return res.status(200).json({ contact: resContact });
      }
      catch (e) {
        return res.status(500).send('Server error!' + '\n' + e);
      }
    }
    else {
      return res.status(403).send('You do not have permission to perform this action');
    }
  }
  catch (e) {
    return res.status(500).send('Server error!' + '\n' + e);
  }
});

module.exports = router;
