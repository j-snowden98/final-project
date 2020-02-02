const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


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
        let reportAccess = await data.isAuthorised(userID, '6');
        let adminAccess = await data.isAuthorised(userID, '5');
        const expiresIn = 2 * 60 * 60;

        //Set userID and username in the JWT token, allowing them to be used for authentication of requests
        const accessToken = jwt.sign({ id: userID, username: username }, SECRET_KEY, { expiresIn: expiresIn });

        //Set access token as a cookie in the client's browser.
        //HTTPonly so it cannot be accessed by client side scripts
        res.status(200).cookie('accessToken', accessToken, { httpOnly: true, maxAge: expiresIn * 1000 }).json({ username: username, report: reportAccess, admin: adminAccess });
        //Username is sent back to user so it can be added to navbar.
        //Uses the username from the request, which has been verified at this point
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

router.post('/logout', (req, res) => {
  //Just needs to clear access cookie.
  res.status(200).clearCookie('accessToken').send('Logged out successfully!');
});

module.exports = router;
