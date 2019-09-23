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
import path from 'path';
import uuid from 'uuid/v4';
import databaseConfig from './config/database';
import initPassport from './config/passport';
import { handleError, EndpointNotFoundError, StartUpError } from './model/Errors';
import scheincriteriaRouter from './services/scheincriteria-service/ScheincriteriaService.routes';
import scheinexamRouter from './services/scheinexam-service/ScheinexamService.routes';
import sheetRouter from './services/sheet-service/SheetService.routes';
import studentRouter from './services/student-service/StudentService.routes';
import tutorialRouter from './services/tutorial-service/TutorialService.routes';
import authenticationRouter from './services/user-service/authentication.routes';
import userService from './services/user-service/UserService.class';
import userRouter from './services/user-service/UserService.routes';
import languageRouter from './services/language-service/LanguageService.routes';
import mailRouter from './services/mail-service/MailService.routes';

const BASE_API_PATH = '/api';
const app = express();

/**
 * Tries to establish a conection to the database.
 *
 * Tries for a certain amount of retries to connect to the MongoDB. If no connection could be established after all retries a `StartUpError` is thrown.
 *
 * The amount of retries can be configured using the database configuration.
 */
async function connectToDB() {
  const maxRetries = databaseConfig.maxRetries || 5;
  let prevTries = 0;

  while (prevTries < maxRetries) {
    console.log(`Connecting to MongoDB database (previous tries: ${prevTries})...`);

    try {
      await mongoose.connect(databaseConfig.databaseURL, {
        useNewUrlParser: true,
        ...databaseConfig.config,
      });

      console.log('Connection to MongoDB database established.');
      return;
    } catch {
      prevTries++;
    }
  }

  throw new StartUpError(`Connection to MongoDB database failed after ${prevTries} retries.`);
}

/**
 * Set up the middleware needed for support of JSON in requests.
 */
function initJSONMiddleware() {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
}

/**
 * Set up the security middleware.
 *
 * This function sets up the security middleware 'passport' and configures sessions.
 */
function initSecurityMiddleware() {
  console.log('Setting up passport...');
  const MongoStore = ConnectMongo(session);
  const mongoStoreOptions: { secret: string } & (
    | MongoUrlOptions
    | MongooseConnectionOptions
    | NativeMongoOptions
    | NativeMongoPromiseOptions) = {
    mongooseConnection: mongoose.connection,
    secret: databaseConfig.secret,
  };

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

  initPassport(passport);

  app.use(passport.initialize());
  app.use(passport.session());

  console.log('Passport setup complete.');
}

/**
 * Registeres the given router to the given endpoint.
 *
 * The given router will be registered for the given endpoint route. The optional endpointName will only be logged and has no further functionality. If no endpointName is provided the endpoint path will be logged instead.
 *
 * @param endpoint Endpoint path
 * @param router Router of that path
 * @param endpointName (optional) Name of path
 */
function registerAPIEndpoint(endpoint: string, router: express.Router, endpointName: string = '') {
  console.log(`Endpoint '${endpointName || endpoint}' registered.`);
  app.use(endpoint, router);
}

/**
 * Initializes the endpoints of express.
 *
 * Adds all API endpoints aswell as everything needed to serve the SPA.
 */
function initEndpoints() {
  console.group('Setting up endpoints...');
  console.log('Registering API endpoints...');
  registerAPIEndpoint(BASE_API_PATH, authenticationRouter, 'authentication');
  registerAPIEndpoint(`${BASE_API_PATH}/user`, userRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/tutorial`, tutorialRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/student`, studentRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/sheet`, sheetRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/scheinexam`, scheinexamRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/scheincriteria`, scheincriteriaRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/mail`, mailRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/locales`, languageRouter);

  // If there's a request which starts with the BASE_API_PATH which did not get handled yet, throw a not found error.
  app.use(BASE_API_PATH, req => {
    throw new EndpointNotFoundError(`Endpoint ${req.url}@${req.method} was not found.`);
  });

  console.log('Registering static endpoint...');
  // Configure the express server to handle requests for the SPA files from the 'public' folder.
  app.use('/static', express.static('app/static'));
  app.use('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });

  app.use(handleError);

  console.log('Endpoints setup complete.');
  console.groupEnd();
}

/**
 * Checks if there's an admin user. If there is none a new one will be created.
 */
async function initAdmin() {
  try {
    await userService.getUserCredentialsWithUsername('admin');
  } catch {
    console.log('Initializing new admin user because there is none...');
    await userService.initAdmin();
    console.log('Admin initializied.');
  }
}

/**
 * Runs the server start up routines.
 */
async function startServer() {
  try {
    await connectToDB();

    initJSONMiddleware();

    initSecurityMiddleware();

    initEndpoints();

    await initAdmin();

    app.listen(8080, () => console.log('Server started on port 8080.'));
  } catch (err) {
    if (err.message) {
      console.group('Server start failed. More infos below:');
      console.error(err.message);
      console.groupEnd();
    } else {
      console.error('Server start failed.');
    }

    process.exit(1);
  }
}

startServer();
