import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { isDevelopment } from '../../helpers/isDevelopment';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class InformationService {
    constructor(private readonly settingsService: SettingsService) {}

    /**
     * Current server version runing. It returns the version depending on if the server is started in development or not.
     *
     * @returns Server version as string. Different in development and production.
     */
    getVersion(): string {
        return isDevelopment() ? this.getDevelopmentVersion() : this.getProductionVersion();
    }

    /**
     * @returns The link to the handbook if configured.
     */
    getHandbookUrl(): string | undefined {
        return this.settingsService.getHandbookUrl();
    }

    private getDevelopmentVersion(): string {
        return `${this.getVersionFromPackage()}_DEV`;
    }

    private getProductionVersion(): string {
        return this.getVersionFromPackage();
    }

    private getVersionFromPackage(): string {
        const pathToPackage = path.resolve(process.cwd(), '..', 'package.json');

        try {
            const contents = fs.readFileSync(pathToPackage).toString();
            const pkgInfo = JSON.parse(contents);

            if (pkgInfo.version) {
                return pkgInfo.version.toString();
            } else {
                Logger.error('package.json does not contain a version field.');
                throw new Error("Package does not contain a 'version' field.");
            }
        } catch (err) {
            Logger.error(`Could not read package.json at path '${pathToPackage}'`);
            throw { message: 'Could not retrieve version from file.' };
        }
    }
}
