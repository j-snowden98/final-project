const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const user = require('./user.js');
const getResidents = require('./searchResidents.js');
const contact = require('./contact.js');
const SECRET_KEY = "secretkey23456";

const app = express();

app.use('/user', user);

const protectedApp = express.Router();
protectedApp.use(cookieParser());
protectedApp.use((req, res, next) => {
  console.log(req.cookies.accessToken);
  const token = req.cookies.accessToken;
  if (token) {
    console.log(token);
    jwt.verify(token, SECRET_KEY, (err, decoded) =>{
      if (err) {
        return res.status(401).json({ success: false, message: 'invalid token' });
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }

  else {
    res.status(401).json({
        success: false,
        message: 'No token provided. Access denied'
    });
  }
});

app.use('/api', protectedApp);

protectedApp.use('/resident/search', getResidents);
protectedApp.use('/resident/contact', contact);
app.use('/', express.static('webpage', { extensions: ['html'] }));
app.listen(8080);
