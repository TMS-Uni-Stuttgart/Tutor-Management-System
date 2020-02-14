import path from 'path';
import fs from 'fs';
import Logger from '../../helpers/Logger';

class InformationService {
  public getVersion(): string {
    try {
      const pathToPackage = path.resolve(process.cwd(), '..', 'package.json');
      const contents = fs.readFileSync(pathToPackage).toString();
      const pkgInfo = JSON.parse(contents);

      if (pkgInfo.version) {
        return pkgInfo.version.toString();
      } else {
        Logger.error('package.json does not contain a version field.');
        throw new Error("Package does not contain a 'version' field.");
      }
    } catch (err) {
      throw { message: 'Could not retrieve version from file.' };
    }
  }
}

const informationService = new InformationService();

export default informationService;
