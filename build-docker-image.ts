import * as childProcess from 'child_process';
import { ExecSyncOptions } from 'child_process';
import * as fs from 'fs';

function getPackageInfo(): any {
  const content = fs.readFileSync('./package.json').toString();

  return JSON.parse(content);
}

const IMAGE_NAME = 'dudrie/tutor-management-system';
const packageInfo = getPackageInfo();

function getLatestOrPre(): 'pre' | 'latest' {
  const args = process.argv;
  const preArgument = args.find((arg) => arg === '--pre');

  return preArgument ? 'pre' : 'latest';
}

function getVersion(): string {
  const args = process.argv;
  const versionArgument = args.find((arg) => arg.includes('--version=') || arg.includes('-v='));

  if (versionArgument === undefined) {
    return packageInfo.version;
  }

  const version = versionArgument.replace(/(--version=)|(-v=)/g, '');

  if (!/\d+\.\d+\.\d+/g.test(version)) {
    console.error('Version argument needs to follow the SemVer pattern: MAJOR.MINOR.PATCH.');
    process.exit(1);
  }
}

function isVersionInTar(): boolean {
  const args = process.argv;
  const versionArgument = args.find((arg) => arg == '--no-version-in-tar-name');

  return !versionArgument;
}

function isSkipBundleStep(): boolean {
  const args = process.argv;
  const isSkipBundleArgument = args.find((arg) => arg === '--skip-bundle');

  return !!isSkipBundleArgument;
}

function getBuildCommand(): string {
  const version = getVersion();
  const preOrLatest = getLatestOrPre();

  if (preOrLatest === 'latest') {
    return `docker build -t=${IMAGE_NAME}:latest -t=${IMAGE_NAME}:${version} .`;
  } else {
    return `docker build -t=${IMAGE_NAME}:${version}-pre .`;
  }
}

function getTarName(): string {
  const version = getVersion();
  const preOrLatest = getLatestOrPre();
  const isVersionInTarName = isVersionInTar();

  let tarName = `Tutor-Management-System`;

  if (isVersionInTarName) {
    tarName += `_v${version}`;
  }

  if (preOrLatest === 'pre') {
    tarName += `-pre`;
  }

  return `${tarName}.tar`;
}

function getBundleCommand(): string {
  const version = getVersion();
  const preOrLatest = getLatestOrPre();

  if (preOrLatest === 'latest') {
    return `docker save -o ${getTarName()} ${IMAGE_NAME}:latest ${IMAGE_NAME}:${version}`;
  } else {
    return `docker save -o ${getTarName()} ${IMAGE_NAME}:${version}-pre`;
  }
}

const options: ExecSyncOptions = {
  stdio: 'inherit',
};

const buildCommand = getBuildCommand();
const bundleCommand = getBundleCommand();

console.log(`Running: "${buildCommand}"`);
childProcess.execSync(buildCommand, options);

if (!isSkipBundleStep()) {
  console.log(`Running: "${bundleCommand}"`);
  childProcess.execSync(bundleCommand, options);
}
