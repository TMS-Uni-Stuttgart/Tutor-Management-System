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
import databaseConfig from './helpers/database';
import initPassport from './helpers/passport';
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
import Logger from './helpers/Logger';
import pdfRouter from './services/pdf-service/PdfService.routes';
import excelRouter from './services/excel-service/ExcelService.routes';

const BASE_API_PATH = '/api';
const app = express();

/**
 * Tries to establish a conection to the database.
 *
 * Tries for a certain amount of retries to connect to the MongoDB. If no connection could be established after all retries a `StartUpError` is thrown.
 *
 * The amount of retries can be configured using the database configuration.
 */
function connectToDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxRetries = databaseConfig.maxRetries || 5;

    async function tryToConnect(prevTries: number) {
      if (prevTries >= maxRetries) {
        return reject(
          new StartUpError(`Connection to MongoDB database failed after ${prevTries} retries.`)
        );
      }

      try {
        Logger.info(`Connecting to MongoDB database (previous tries: ${prevTries})...`);

        await mongoose.connect(databaseConfig.databaseURL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ...databaseConfig.config,
        });

        Logger.info('Connection to MongoDB database established.');

        return resolve();
      } catch {
        setTimeout(() => tryToConnect(++prevTries), 1000);
      }
    }

    tryToConnect(0);
  });
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
  Logger.info('Setting up passport...');
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

  Logger.info('Passport setup complete.');
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
  Logger.info(`\tEndpoint '${endpointName || endpoint}' registered.`);
  app.use(endpoint, router);
}

/**
 * Initializes the endpoints of express.
 *
 * Adds all API endpoints aswell as everything needed to serve the SPA.
 */
function initEndpoints() {
  Logger.info('Setting up endpoints...');
  Logger.info('Registering API endpoints...');
  registerAPIEndpoint(BASE_API_PATH, authenticationRouter, 'authentication');
  registerAPIEndpoint(`${BASE_API_PATH}/user`, userRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/tutorial`, tutorialRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/student`, studentRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/sheet`, sheetRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/scheinexam`, scheinexamRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/scheincriteria`, scheincriteriaRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/mail`, mailRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/pdf`, pdfRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/excel`, excelRouter);
  registerAPIEndpoint(`${BASE_API_PATH}/locales`, languageRouter);

  // If there's a request which starts with the BASE_API_PATH which did not get handled yet, throw a not found error.
  app.use(BASE_API_PATH, req => {
    throw new EndpointNotFoundError(`Endpoint ${req.url}@${req.method} was not found.`);
  });

  Logger.info('\tRegistering static endpoint...');
  // Configure the express server to handle requests for the SPA files from the 'public' folder.
  app.use('/static', express.static('app/static'));
  app.use('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });

  app.use(handleError);

  Logger.info('Endpoints setup complete.');
}

/**
 * Checks if there's an admin user. If there is none a new one will be created.
 */
async function initAdmin() {
  try {
    await userService.getUserCredentialsWithUsername('admin');
  } catch {
    Logger.info('Initializing new admin user because there is none...');
    await userService.initAdmin();
    Logger.info('Admin initializied.');
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

    app.listen(8080, () => Logger.info('Server started on port 8080.'));
  } catch (err) {
    if (err.message) {
      Logger.error(`Server start failed. Error: ${err.message}`, { error: err });
    } else {
      Logger.error('Server start failed.');
    }

    process.exit(1);
  }
}

startServer();
