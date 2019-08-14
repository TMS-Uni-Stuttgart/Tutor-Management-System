var exec = require('child_process').execSync;

var options = {
  encoding: 'utf8',
};

console.log('Running "mvn formatter:format" in root folder...');
console.log(exec('mvn formatter:format', options));

console.log('Running "mvn process-classes" in root folder...')
console.log(exec('mvn process-classes', options));

console.log('Running "npm run ts:check" in client folder...');
console.log(exec('cd client && npm run ts:check', options));

console.log('Running "npm run ts:fix" in client folder...');
console.log(exec('cd client && npm run ts:fix', options));