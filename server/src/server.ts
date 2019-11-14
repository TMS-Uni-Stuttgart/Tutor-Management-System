import { Server } from 'http';
import mongoose from 'mongoose';
import pkgInfo from '../package.json';
import initApp from './app';
import { databaseConfig } from './helpers/config';
import Logger from './helpers/Logger';
import { StartUpError } from './model/Errors';
import { initScheincriteriaBlueprints } from './model/scheincriteria/Scheincriteria';
import userService from './services/user-service/UserService.class';

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
    Logger.info(`Starting server with version ${pkgInfo.version}...`);

    await connectToDB();

    initScheincriteriaBlueprints();

    const app = initApp();

    await initAdmin();

    const server = app.listen(8080, () =>
      Logger.info(`Server (v${pkgInfo.version}) started on port 8080.`)
    );

    // Mark every active request so the server can be gracefully stopped.
    server.on('request', (req, res) => {
      req.socket._isIdle = false;

      res.on('finish', () => {
        req.socket._isIdle = true;
      });
    });

    process.on('SIGTERM', () => gracefullyStopServer(server));
    process.on('SIGINT', () => gracefullyStopServer(server));
  } catch (err) {
    if (err.message) {
      Logger.error(`Server start failed. Error: ${err.message}`, { error: err });
    } else {
      Logger.error('Server start failed.');
    }

    process.exit(1);
  }
}

function gracefullyStopServer(server: Server) {
  Logger.info('Termination signal received.');
  Logger.info('Closing HTTP server...');
  server.close(() => {
    Logger.info('HTTP server closed.');
    Logger.info('Waiting for pending requests...');
    Logger.info('Closing database connection...');

    mongoose.disconnect(() => {
      process.exit(0);
    });
  });
}

startServer();
