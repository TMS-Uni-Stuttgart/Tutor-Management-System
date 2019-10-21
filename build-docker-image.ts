import * as childProcess from 'child_process';
import { ExecSyncOptions } from 'child_process';
import packageInfo from './package.json';

const IMAGE_NAME = 'dudrie/tutor-management-system';

function getLatestOrPre(): 'pre' | 'latest' {
  const args = process.argv;
  const preArgument = args.find(arg => arg.includes('--pre') || arg.includes('-p'));

  return preArgument ? 'pre' : 'latest';
}

function getVersion(): string {
  const args = process.argv;
  const versionArgument = args.find(arg => arg.includes('--version') || arg.includes('-v'));

  if (versionArgument === undefined) {
    return packageInfo.version;
  }

  const version = versionArgument.replace(/(--version=)|(-v=)/g, '');

  if (!/\d+\.\d+\.\d+/g.test(version)) {
    console.error('Version argument needs to follow the SemVer pattern: MAJOR.MINOR.PATCH.');
    process.exit(1);
  }
}

function isSkipBundleStep(): boolean {
  const args = process.argv;
  const isSkipBundleArgument = args.find(arg => arg.includes('--skip-bundle'));

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

function getBundleCommand(): string {
  const version = getVersion();
  const preOrLatest = getLatestOrPre();

  if (preOrLatest === 'latest') {
    return `docker save -o Tutor-Management-System_v${version}.tar ${IMAGE_NAME}:latest ${IMAGE_NAME}:${version}`;
  } else {
    return `docker save -o Tutor-Management-System_v${version}-pre.tar ${IMAGE_NAME}:${version}-pre`;
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
