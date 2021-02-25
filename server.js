const express = require("express");
const logger = require("morgan");
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const logs = require('./logs');
const fs = require('fs');
const { userRouter } = require("./routers/user.router");
const { flightRouter } = require("./routers/flight.router");
const { feedbackRouter } = require("./routers/feedback.router");
const { weatherRouter } = require("./routers/weather.router");
const { authRouter  } = require("./routers/auth.router");
const passportSetup = require("./config/passport-setup");
const passport = require('passport');
//const keys=require('./config/keys');
const cookieParser = require("cookie-parser");
const constants = require('./constants')

const app = express();
const port = process.env.PORT || 8080

app.use(logger('combined', {
  stream: fs.createWriteStream('./logs.txt', {flags: 'a'})
}));
app.use(logger('dev'));
app.set('trust proxy', true);
app.use(session({
  resave: false,
  saveUninitialized: false,
    secret: 'thenetninjaisawesomeiguess',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    },
    name: "sessionId",
    store: MongoStore.create({
        mongoUrl: constants.DB_HOST,
        clientPromise:  {useNewUrlParser: true, useUnifiedTopology: true},
        collectionName: 'session'
    })
}));

app.use(cookieParser());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true //
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(logger("dev"));

const router = express.Router();
app.use('/api/users', userRouter);
app.use('/api/flights', flightRouter);
app.use('/api/feedbacks', feedbackRouter);
app.use('/api/weather', weatherRouter);

app.use('/auth', authRouter);

const authCheck = (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        authenticated: false,
        message: "user has not been authenticated"
      });
    } else {
      next();
    }
  };
  app.get("/", authCheck, (req, res) => {
    res.status(200).json({
      authenticated: true,
      message: "user successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  });

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Content-Type', 'application/json');
    next();
});

app.get("/", (req, res) => {
    res.status(200).send(`Welcome to OpenSky`);
});

app.get("*", (req, res) => {
    res.status(404).send(`Page Not Found`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is broken!');
});

app.listen(port, () => console.log('Express server is running on port ', port));
