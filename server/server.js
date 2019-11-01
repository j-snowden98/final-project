const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const login = require('./login.js');
const SECRET_KEY = "secretkey23456";

const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  /*const userID = await login.attemptLogin(username, password);

  if(userID) {
    const expiresIn = 24 * 60 * 60;
    const accessToken = jwt.sign({ id: userID }, SECRET_KEY, {
    expiresIn: expiresIn
    });
    res.status(200).send({ "user": userID, "access_token": accessToken, "expires_in": expiresIn});
  }*/
  login.attemptLogin(username, password, (err, userID)=>{
    if (err) return res.status(500).send('Server error!');
    if (!userID) return res.status(404).send('User not found!');
    const expiresIn = 24 * 60 * 60;
    const accessToken = jwt.sign({ id: userID }, SECRET_KEY, {
    expiresIn: expiresIn
    });
    res.status(200).send({ "user": userID, "access_token": accessToken, "expires_in": expiresIn});
  });
});

app.use(router);
app.use('/', express.static('webpage', { extensions: ['html'] }));
app.listen(8080);
