const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const account = require('./businessLogic/account.js');
const getResidents = require('./businessLogic/searchResidents.js');
const contact = require('./businessLogic/contact.js');
const admin = require('./businessLogic/admin.js');
const report = require('./businessLogic/report.js');
const SECRET_KEY = "secretkey23456";

//Create express server
const app = express();

//This is a router used for the main API
//proctects all routes by checking for a valid token
const protectedApp = express.Router();
protectedApp.use(cookieParser());
protectedApp.use((req, res, next) => {
  //Get token from cookie. If not defined, immediately return 401.
  const token = req.cookies.accessToken;
  if (token) {
    //Check the token to see if it's valid. If not, return 401. If token validates, forward request to next route
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
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

//This is the only route not requiring a token, to log a user in.
app.use('/account', account);

//All api routes will used the protectedApp middleware first
app.use('/api', protectedApp);

//Here are the other routers, to separate functionality into different APIs
protectedApp.use('/resident/search', getResidents);
protectedApp.use('/resident/contact', contact);
protectedApp.use('/admin', admin);
protectedApp.use('/report', report);
app.use('/', express.static('webpage', { extensions: ['html'] }));
app.listen(8080);
