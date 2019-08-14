import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import databaseConfig from './config/database';
import initPassport from './config/passport';
import authenticationRouter from './routes/authentication';
import userService from './services/UserService';

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

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authenticationRouter);

app.listen(8080, () => console.log('Server started on port 8080.'));
