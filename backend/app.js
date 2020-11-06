var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var samlRouter = require('./routes/saml-route');

var app = express();

const sess = {
  secret: process.env.APP_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false },
}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sess));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', indexRouter);
app.use('/acs', samlRouter);

module.exports = app;
