import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import uuid from 'uuid/v4';
import databaseConfig from './config/database';
import initPassport from './config/passport';
import authenticationRouter from './routes/authentication';
import userService from './services/UserService';
import userRouter from './routes/user';

mongoose.connect(databaseConfig.databaseURL, databaseConfig.config).catch(err => {
  console.group('Error stack:');
  console.error(err);
  console.groupEnd();

  console.error('Connection to MongoDB database failed.');
});

const db = mongoose.connection;
db.once('open', async () => {
  console.log('Connection to MongoDB database established.');

  userService.getUserWithUsername('admin').catch(async () => {
    console.log('Initializing new admin user because there is none..');
    await userService.initAdmin();
    console.log('Admin initializied.');
  });
});

const app = express();
const BASE_API_PATH = '/api';

initPassport(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    genid: () => {
      return uuid();
    },
    secret: 'keyboard cat',
    resave: false,
    // Is ued to extend the expries date on every request. This means, maxAge is relative to the time of the last request of a user.
    rolling: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(BASE_API_PATH, authenticationRouter);
app.use(`${BASE_API_PATH}/user`, userRouter);

app.listen(8080, () => console.log('Server started on port 8080.'));
