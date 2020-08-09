/* eslint-disable no-console */
import axios from 'axios';
import chalk from 'chalk';
import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio,
  spawnSync,
} from 'child_process';
import os from 'os';
import { login } from '../util/login';

function addConsoleToProcess(childProcess: ChildProcessWithoutNullStreams) {
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
}

function stopOnError(msg: string): never {
  console.error(chalk.red(msg));
  process.exit(1);
}

function getCommand(command: string): string {
  return os.platform() === 'win32' ? `${command}.cmd` : command;
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

async function tryToConnect() {
  const waitInSeconds: number = 5;

  for (let i = 1; i < 11; i++) {
    try {
      console.log(chalk.blue('Trying to connect to the server...'));
      const response = await axios.get('http://localhost:8080');

      if (response.status !== 200) {
        return Promise.reject(
          `Could not get the index page from the server. Response code '${response.status}: ${response.statusText}.`
        );
      }

      return response;
    } catch {
      console.error(
        chalk.red(`Could not connect on try no ${i}. Retrying in ${waitInSeconds} seconds...`)
      );
      await wait(waitInSeconds * 1000);
    }
  }

  return Promise.reject('Could not connect to the server after 10 retries.');
}

async function tryPdf() {
  console.log(chalk.blue('Trying to create a PDF...'));
  console.log(chalk.blue('Logging into the server...'));

  try {
    const axios = await login('admin', 'admin');
    console.log(chalk.green('Successfully logged in.'));

    console.log(chalk.blue('Sending request for PDF...'));
    const response = await axios.get('/pdf/credentials');

    if (response.status !== 200) {
      throw new Error(
        `PDF generation failed -- ${response.status}: ${response.statusText}:\n${response.data}`
      );
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function run(): Promise<void> {
  const IMAGE_NAME = 'dudrie/tms-test';
  spawnSync('clear');

  console.log(chalk.blue(`Start building a docker image '${IMAGE_NAME}' ...`));
  const buildProcess = spawn(getCommand('yarn'), [
    'run',
    'ts-node',
    '../build-docker-image.ts',
    `--name=${IMAGE_NAME}`,
    '--version=0.0.0',
    '--pre',
    '--cwd=./..',
    '--force-rm',
  ]);

  addConsoleToProcess(buildProcess);
  buildProcess.on('exit', async (code) => {
    if (code !== 0) {
      stopOnError('Building the docker image failed.');
    }

    console.log(chalk.green(`Docker image '${IMAGE_NAME}' successfully build.`));
    console.log(chalk.blue('Starting image in container...'));

    const spawnOptions: SpawnOptionsWithoutStdio = { cwd: './build-test-docker' };
    const containerProcess = spawn('docker-compose', ['up'], spawnOptions);
    addConsoleToProcess(containerProcess);

    containerProcess.on('exit', (code) => {
      if (code !== 0) {
        stopOnError(`Could not start docker container with image '${IMAGE_NAME}'.`);
      }
    });

    containerProcess.on('error', (err) => {
      stopOnError(`${err.name}: ${err.message}`);
    });

    await wait(10000);

    let exitCode = 0;
    try {
      await tryToConnect();

      console.log(chalk.green('Successfully connected to the running TMS container.'));

      await tryPdf();

      console.log(chalk.green('Successfully generated a PDF.'));
    } catch (err) {
      console.error(chalk.red(err));
      exitCode = 1;
    } finally {
      console.log(chalk.blue('Shutting down containers...'));

      const result = spawnSync('docker-compose', ['down', '-v'], {
        ...spawnOptions,
        stdio: 'inherit',
      });

      if (result.error) {
        stopOnError(result.error.message);
      }

      console.log(chalk.green('Containers are shut down.'));

      console.log(chalk.blue(`Exiting process (code: ${exitCode})`));
      process.exit(exitCode);
    }
  });
}

run().catch((err) => console.log(err.message));
