var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var cors = require('cors');

var indexRouter = require('./routes/index');
var samlRouter = require('./routes/saml-route');

var app = express();

const corsOptions = {
  origin: ['*', 'http://localhost:3000', 'http://localhost:3001', 'https://onfidosedemo.oktapreview.com'],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const sess = {
  secret: process.env.APP_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false },
};
app.use(cors(corsOptions));
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
app.use('/saml', samlRouter);

module.exports = app;
