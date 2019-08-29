import bodyParser from 'body-parser';
import ConnectMongo, {
  MongooseConnectionOptions,
  MongoUrlOptions,
  NativeMongoOptions,
  NativeMongoPromiseOptions,
} from 'connect-mongo';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import uuid from 'uuid/v4';
import databaseConfig from './config/database';
import initPassport from './config/passport';
import authenticationRouter from './routes/authentication';
import sheetRouter from './routes/sheet';
import studentRouter from './routes/student';
import tutorialRouter from './routes/tutorial';
import userRouter from './routes/user';
import userService from './services/UserService';
import scheinexamRouter from './routes/scheinexam';

mongoose.connect(databaseConfig.databaseURL, databaseConfig.config).catch(err => {
  console.group('Error stack:');
  console.error(err);
  console.groupEnd();

  console.error('Connection to MongoDB database failed.');
});

const db = mongoose.connection;
const app = express();
const BASE_API_PATH = '/api';
const MongoStore = ConnectMongo(session);
const mongoStoreOptions: { secret: string } & (
  | MongoUrlOptions
  | MongooseConnectionOptions
  | NativeMongoOptions
  | NativeMongoPromiseOptions) = {
  mongooseConnection: mongoose.connection,
  secret: databaseConfig.secret,
};

db.once('open', async () => {
  console.log('Connection to MongoDB database established.');

  userService.getUserCredentialsWithUsername('admin').catch(async () => {
    console.log('Initializing new admin user because there is none..');
    await userService.initAdmin();
    console.log('Admin initializied.');
  });
});

initPassport(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    genid: () => {
      return uuid();
    },
    secret: databaseConfig.secret,
    store: new MongoStore(mongoStoreOptions),
    resave: false,
    // Is used to extend the expries date on every request. This means, maxAge is relative to the time of the last request of a user.
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
app.use(`${BASE_API_PATH}/tutorial`, tutorialRouter);
app.use(`${BASE_API_PATH}/student`, studentRouter);
app.use(`${BASE_API_PATH}/sheet`, sheetRouter);
app.use(`${BASE_API_PATH}/scheinexam`, scheinexamRouter);

app.listen(8080, () => console.log('Server started on port 8080.'));
