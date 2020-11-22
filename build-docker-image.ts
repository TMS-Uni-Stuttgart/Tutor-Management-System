import * as childProcess from 'child_process';
import { ExecSyncOptions } from 'child_process';
import * as fs from 'fs';

interface ArgumentOptions {
  name: string;
  short?: string;
  hasValue?: boolean;
}

const DEFAULT_IMAGE_NAME = 'ghcr.io/dudrie/tutor-management-system';

function getArgValue({ name, short, hasValue }: ArgumentOptions): string | undefined {
  const args = process.argv;
  const nameExpression = `--${name}${hasValue ? '=' : ''}`;
  const shortExpression = short ? `-${short}${hasValue ? '=' : ''}` : undefined;

  const argValue = args.find((arg) => {
    if (arg.includes(nameExpression)) {
      return true;
    }

    if (!!shortExpression && arg.includes(shortExpression)) {
      return true;
    }

    return false;
  });

  if (!argValue) {
    return undefined;
  }

  if (hasValue) {
    const shortRegexPattern: string = shortExpression ? `|(${shortExpression})` : '';
    const regex = new RegExp(`(${nameExpression})${shortRegexPattern}`, 'g');
    return argValue.replace(regex, '');
  } else {
    return argValue;
  }
}

function getCwd(): string {
  const cwdArgument = getArgValue({ name: 'cwd', hasValue: true });

  if (!cwdArgument) {
    return process.cwd();
  } else {
    return cwdArgument.replace(/(--cwd=)/g, '');
  }
}

function getPackageInfo(): any {
  const content = fs.readFileSync('./package.json').toString();

  return JSON.parse(content);
}

function getLatestOrPre(): 'pre' | 'latest' {
  const preArgument = getArgValue({ name: 'pre' });

  return preArgument ? 'pre' : 'latest';
}

function getVersion(): string {
  const version = getArgValue({ name: 'version', short: 'v', hasValue: true });

  if (version === undefined) {
    return getPackageInfo().version;
  }

  if (!/\d+\.\d+\.\d+/g.test(version)) {
    console.error('Version argument needs to follow the SemVer pattern: MAJOR.MINOR.PATCH.');
    process.exit(1);
  }

  return version;
}

function getImageName(): string {
  const nameArgument = getArgValue({ name: 'name', short: 'n', hasValue: true });

  return nameArgument ?? DEFAULT_IMAGE_NAME;
}

function isVersionInTar(): boolean {
  const noVersionInTar = getArgValue({ name: 'no-version-in-tar-name' });
  return !noVersionInTar;
}

function isBundleStepActive(): boolean {
  const isSkipBundleArgument = getArgValue({ name: 'bundle' });

  return !!isSkipBundleArgument;
}

function getForceRemoveContainersOptions(): string {
  const forceRmArg = getArgValue({ name: 'force-rm' });

  return !!forceRmArg ? '--force-rm' : '';
}

function getBuildCommand(): string {
  const version = getVersion();
  const preOrLatest = getLatestOrPre();
  const imageName = getImageName();
  const forceRemoveContainers = getForceRemoveContainersOptions();

  if (preOrLatest === 'latest') {
    return `docker build ${forceRemoveContainers} -t=${imageName}:latest -t=${imageName}:${version} .`;
  } else {
    return `docker build ${forceRemoveContainers} -t=${imageName}:${version}-pre .`;
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
  const imageName = getImageName();

  if (preOrLatest === 'latest') {
    return `docker save -o ${getTarName()} ${imageName}:latest ${imageName}:${version}`;
  } else {
    return `docker save -o ${getTarName()} ${imageName}:${version}-pre`;
  }
}

const options: ExecSyncOptions = {
  stdio: 'inherit',
  cwd: getCwd(),
  env: {
    DOCKER_BUILDKIT: '1',
  },
};

const buildCommand = getBuildCommand();
const bundleCommand = getBundleCommand();

console.log(`Running: "${buildCommand}"`);
childProcess.execSync(buildCommand, options);

if (isBundleStepActive()) {
  console.log(`Running: "${bundleCommand}"`);
  childProcess.execSync(bundleCommand, options);
}
