import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export class MissingKeyContainer {
    private readonly missingKeys: string[];

    constructor(keys: Record<string, string | string[]>) {
        this.missingKeys = [];

        Object.keys(keys).forEach((key) => {
            // Check if the key is __not__ the timestamp!
            if (key !== '_t') {
                this.missingKeys.push(key);
            }
        });
    }

    getMissingKeys(): string[] {
        return [...this.missingKeys];
    }
}

interface AddMissingLanguageKeyParams {
    lang: string;
    namespace: string;
    container: MissingKeyContainer;
}

@Injectable()
export class LocalesService {
    private readonly logger = new Logger(LocalesService.name);

    addMissingLanguageKey(params: AddMissingLanguageKeyParams): void {
        const { lang, namespace, container } = params;

        this.logger.warn(`Got missing keys for language and namespace ${lang}:${namespace}`);

        const pathToFile = path.resolve('logs', 'missing_locales', `${namespace}.json`);

        try {
            this.createDefaultFileIfNecessary(pathToFile);
            this.isFileReadWriteableOrThrow(pathToFile);

            const content = fs.readFileSync(pathToFile, { encoding: 'utf8' });
            const missingKeys: Record<string, string> = JSON.parse(content);

            container.getMissingKeys().forEach((key) => {
                if (!missingKeys[key]) {
                    missingKeys[key] = key;
                }
            });

            fs.writeFileSync(pathToFile, JSON.stringify(missingKeys, null, 2));
        } catch (err) {
            let stack: String;
            if (err instanceof Error) {
                stack = err.stack ?? 'Unknown stack';
            } else {
                stack = 'Unknown stack';
            }

            this.logger.error('Could not save the missing language keys to a file:', stack);
            throw new BadRequestException('Could not save the missing language keys to a file');
        }
    }

    private createDefaultFileIfNecessary(pathToFile: string): void {
        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
            fs.writeFileSync(pathToFile, '{}');
        }
    }

    /**
     * Will throw an error if there are no Read/Write permissions.
     *
     * If permission are given nothing happens.
     *
     * @param pathToFile Path to file.
     *
     * @throws `Error` - If file can not be read or written.
     */
    private isFileReadWriteableOrThrow(pathToFile: string): void {
        //
        fs.accessSync(pathToFile, fs.constants.R_OK | fs.constants.W_OK);
    }
}
