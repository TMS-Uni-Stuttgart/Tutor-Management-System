const args = process.argv;
const exec = require('child_process').execSync;
const arg3 = '';
if (args[4] != undefined) {
  arg3 = args[4];
}

const cmd = 'cd client && ' + args[2] + ' ' + args[3] + ' ' + arg3;

const options = {
  encoding: 'utf8',
};

console.log(exec(cmd, options));
