const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const user = require('./user.js');
const contact = require('./contact.js');
const SECRET_KEY = "secretkey23456";

const app = express();

app.use('/user', user);
app.use('/resident/contact', contact);
app.use('/', express.static('webpage', { extensions: ['html'] }));
app.listen(8080);
