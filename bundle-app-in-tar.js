var exec = require('child_process').execSync;

var options = {
  encoding: 'utf8',
};

console.log('Creating Docker image');
console.log(exec('docker build --tag=tutor-management-system .', options));

console.log('Save Docker image to tar file')
console.log(exec('docker save -o Tutor-Management-System.tar tutor-management-system', options));