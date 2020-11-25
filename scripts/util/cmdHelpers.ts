/* eslint-disable no-console */
import chalk from 'chalk';
import { ChildProcessWithoutNullStreams } from 'child_process';
import os from 'os';

export interface MessageOptions {
  prefix: string;
  color: string;
}

export interface AddColoredProcessParams extends MessageOptions {
  childProcess: ChildProcessWithoutNullStreams;
}

export interface WriteColoredMessageParams extends MessageOptions {
  message: string;
}

export function writeColoredMessage({ message, color, prefix }: WriteColoredMessageParams): void {
  // Remove trailing '\n' to fix an issue where the buffer from child_process would create a new, additional line after each line.
  const parsedMessage = message.endsWith('\n') ? message.substring(0, message.length - 1) : message;

  console.log(chalk.keyword(color)(`[${prefix}]: ${parsedMessage}`));
}

export function addColoredConsoleToProcess({
  childProcess,
  prefix,
  color,
}: AddColoredProcessParams): void {
  childProcess.stdout.on('data', (data: Buffer) => {
    writeColoredMessage({ message: data.toString(), prefix, color });
  });
}

export function getCommand(command: string): string {
  return os.platform() === 'win32' ? `${command}.cmd` : command;
}

export function addConsoleToProcess(childProcess: ChildProcessWithoutNullStreams): void {
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
}

export function stopOnError(msg: string): never {
  console.error(chalk.red(msg));
  process.exit(1);
}
