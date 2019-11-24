const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const user = require('./user.js');
const getResidents = require('./searchResidents.js');
const contact = require('./contact.js');
const SECRET_KEY = "secretkey23456";

const app = express();

app.use('/user', user);

const protectedApp = express.Router();
protectedApp.use(bodyParser.urlencoded({ extended: false }));
protectedApp.use(bodyParser.json());
protectedApp.use((req, res, next) => {
  const token = req.headers['access-token'];
  if (token) {
    console.log(token);
    jwt.verify(token, SECRET_KEY, (err, decoded) =>{
      if (err) {
        return res.json({ message: 'invalid token' });
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }

  else {
    res.send({
        message: 'No token provided.'
    });
  }
});

app.use('/api', protectedApp);

protectedApp.use('/resident/search', getResidents);
protectedApp.use('/resident/contact', contact);
app.use('/', express.static('webpage', { extensions: ['html'] }));
app.listen(8080);
