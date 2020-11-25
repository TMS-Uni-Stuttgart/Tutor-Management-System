/* eslint-disable no-console */
import { spawn } from 'child_process';
import copyfiles from 'copyfiles';
import {
  addColoredConsoleToProcess,
  getCommand,
  MessageOptions,
  writeColoredMessage,
} from './util/cmdHelpers';

const yarn = getCommand('yarn');

function buildClient(): Promise<void> {
  return new Promise((resolve, reject) => {
    const clientMsgOptions: MessageOptions = { prefix: 'client', color: 'cyan' };
    writeColoredMessage({ message: 'Building client...\n', ...clientMsgOptions });

    const childProcess = spawn(`${yarn}`, ['build'], { cwd: '../client' });

    addColoredConsoleToProcess({ childProcess, ...clientMsgOptions });

    childProcess.on('exit', (code) => {
      if (code !== 0) {
        writeColoredMessage({ message: 'Client build failed.', ...clientMsgOptions, color: 'red' });
        reject();
      } else {
        writeColoredMessage({ message: 'Client successfully build.', ...clientMsgOptions });
        resolve();
      }
    });
  });
}

function buildServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverMsgOptions: MessageOptions = { prefix: 'server', color: 'orange' };
    writeColoredMessage({ message: 'Building server...\n', ...serverMsgOptions });

    const childProcess = spawn(`${yarn}`, ['build'], { cwd: '../server' });

    addColoredConsoleToProcess({ childProcess, ...serverMsgOptions });

    childProcess.on('exit', (code) => {
      if (code !== 0) {
        writeColoredMessage({ message: 'Server build failed.', ...serverMsgOptions, color: 'red' });
        reject();
      } else {
        writeColoredMessage({ message: 'Server successfully build.', ...serverMsgOptions });
        resolve();
      }
    });
  });
}

function copyClientIntoServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const copyMsgOptions: MessageOptions = { prefix: 'copy', color: 'green' };
    writeColoredMessage({ message: 'Copying client into server build...', ...copyMsgOptions });

    copyfiles(
      [
        '../client/build/*',
        '../client/build/js/**/*',
        '../client/build/css/**/*',
        '../client/build/static/**/*',
        '../server/dist/app',
      ],
      { error: true, up: 3, verbose: false },
      (error) => {
        if (!!error) {
          writeColoredMessage({
            message: `${error.message} (${error.name})`,
            ...copyMsgOptions,
            color: 'red',
          });
          reject();
        } else {
          writeColoredMessage({ message: 'Files successfully copied.', ...copyMsgOptions });
          resolve();
        }
      }
    );
  });
}

async function run(): Promise<void> {
  await Promise.all([buildClient(), buildServer()]);
  await copyClientIntoServer();
}

run();
