const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const jwt = require('jsonwebtoken');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/add', async (req, res) => {
  const userID = req.body.userID;
  try {
    const auth = await data.getAuthorised(userID, 3);
    if(auth) {
      try {
        const resID = req.body.resID;
        const callBell = req.body.callBell;
        const drinkGiven = req.body.drinkGiven;
        const description = req.body.description;
        const result = await data.insertContact(resID, userID, callBell, drinkGiven, description);
        console.log(result);
        return res.status(200).send({ "success":true });
      }
      catch (e) {
        return res.status(500).send('Server error!');
      }
    }
    else {
      //not authorised code
    }
  }
  catch (e) {
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
