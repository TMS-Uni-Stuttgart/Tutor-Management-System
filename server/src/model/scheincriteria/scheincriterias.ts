import * as fs from 'fs';

export interface Scheincriteria {
  readonly identifier: string;
}

export function initScheincriteriaBlueprints() {
  console.log(__dirname);
  fs.readdirSync(__dirname + '/criterias')
    .filter(file => file.match(/\.(js|ts)$/) !== null)
    .forEach(file => {
      console.log(file);
      require('./criterias/' + file);
    });
}
