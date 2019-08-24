const exec = require('child_process').execSync;

const options = {
  encoding: 'utf8',
};

console.log('Running "mvn formatter:format" in root folder...');
console.log(exec('mvn formatter:format', options));

console.log('Running "mvn process-classes" in root folder...');
console.log(exec('mvn process-classes', options));

console.log('Running "yarn ts:check" in client folder...');
console.log(exec('cd client && yarn ts:check', options));

console.log('Running "yarn ts:fix" in client folder...');
console.log(exec('cd client && yarn eslint:fix', options));

console.log('Running "yarn ts:check" in server folder...');
console.log(exec('cd server && yarn ts:check', options));

console.log('Running "yarn ts:fix" in server folder...');
console.log(exec('cd server && yarn eslint:fix', options));

console.log('Running "yarn ts:check" in shared folder...');
console.log(exec('cd shared && yarn ts:check', options));

console.log('Running "yarn ts:fix" in shared folder...');
console.log(exec('cd shared && yarn eslint:fix', options));
