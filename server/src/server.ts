import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import uuid from 'uuid/v4';
import databaseConfig from './config/database';
import initPassport from './config/passport';
import userService from './services/UserService';
import authenticationRouter from './routes/authentication';

mongoose.connect(databaseConfig.databaseURL, databaseConfig.config).catch(err => {
  console.group('Error stack:');
  console.error(err);
  console.groupEnd();

  console.error('Connection to MongoDB database failed.');
});

const db = mongoose.connection;
db.once('open', async () => {
  console.log('Connection to MongoDB database established.');

  try {
    await userService.getUserWithUsername('admin');
  } catch (err) {
    console.log('Initializing new admin user because there is none..');
    await userService.initAdmin();
    console.log('Admin initializied.');
  }
});

const app = express();

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
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authenticationRouter);

app.listen(8080, () => console.log('Server started on port 8080.'));
