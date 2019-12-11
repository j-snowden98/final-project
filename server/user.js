const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  try {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        if(!err) {
          console.log(hash);
          await data.addUser(username, hash, role);
          res.status(200).send({ 'user': username });
        }
      });
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }

});

router.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await data.getHash(username);
    if(user) {
      //if username mstches one in the database, do the following
      let hash = await user.password;
      let userID = await user.id;
      console.log(hash);
      console.log(userID);
      const result = bcrypt.compareSync(password, hash);
      if (result) {
        //if password validates, send jwt token back to user
        const expiresIn = 2 * 60 * 60;
        const accessToken = jwt.sign({ id: userID }, SECRET_KEY, {
        expiresIn: expiresIn
        });


        const cookieOptions = {
          httpOnly: true
        }
        res.status(200).cookie('accessToken', accessToken, { httpOnly: true, maxAge: expiresIn * 1000 }).send({ "user": userID, "access_token": accessToken, "expires_in": expiresIn});
      }
      else {
        //if password fails, do not log them in
        return res.status(401).send('Incorrect username and/or password!');
      }
    }
    else {
      //username could not be found in database
      return res.status(401).send('Incorrect username and/or password!');
    }
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
