import path from 'path';
import fs from 'fs';
import Logger from '../../helpers/Logger';

class LanguageService {
  public addMissingLanguageKey(
    lang: string,
    namespace: string,
    params: { [key: string]: string[] }
  ) {
    Logger.warn(
      `Missing language keys detected for language '${lang}' in namespace '${namespace}'`
    );

    const keys: string[] = [];

    Object.keys(params).forEach(key => {
      if (key !== '_t') {
        keys.push(key);
      }
    });

    // TODO: Make path configurable
    const pathToFile = path.resolve('./', 'missing_locales', lang, `${namespace}.json`);

    try {
      if (!fs.existsSync(pathToFile)) {
        fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
      }

      if (!fs.existsSync(pathToFile)) {
        fs.writeFileSync(pathToFile, '{}');
      }

      // Will throw an error if there are no Read/Write permissions
      fs.accessSync(pathToFile, fs.constants.R_OK | fs.constants.W_OK);

      const content = fs.readFileSync(pathToFile, { encoding: 'utf8' });
      const missingKeys: { [key: string]: string } = JSON.parse(content);

      keys.forEach(key => {
        if (!missingKeys[key]) {
          missingKeys[key] = key;
        }
      });

      fs.writeFileSync(pathToFile, JSON.stringify(missingKeys, null, 2));
    } catch (error) {
      throw new Error('Could not save the missing language keys to a file.');
    }
  }
}

const languageService = new LanguageService();

export default languageService;
