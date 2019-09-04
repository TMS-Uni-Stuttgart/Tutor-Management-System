import * as fs from 'fs';

export function initScheincriteriaBlueprints() {
  console.group('Scanning for schein criterias...');

  fs.readdirSync(__dirname + '/criterias')
    .filter(file => file.match(/\.(js|ts)$/) !== null)
    .forEach(file => {
      require('./criterias/' + file);
    });

  console.groupEnd();
  console.log('Scanning for schein criterias finished.');
}
