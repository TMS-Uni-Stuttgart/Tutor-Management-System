import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SettingsService } from '../module/settings/settings.service';

const ALLOWED_EXTENSIONS = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

/**
 * Handles `NotFoundExceptions` if a requested endpoint could not be found.
 *
 * This filter enables the NestJS server to handle a SPA without interfering with the routing of said SPA.
 *
 * If a path could not be found the exception filter will take care of returning the correct thing:
 * - If the requested URL starts with the `API_PREFIX` (ie '/api') the correct 404-error is returned.
 * - Else if the requested URL ends with a file extension (like '.js') the corresponding static file is returned (if it exists).
 * - Else the 'index.html' file from the static folder is returned (if it exists).
 */
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  /**
   * @param staticPath Path to the folder which holds the static assets.
   */
  constructor(
    private readonly settings: SettingsService,
    private readonly staticPath: string = '/static'
  ) {}

  /**
   * Handles the catched exception according to the class documentation.
   *
   * @param exception Catched NotFoundException
   * @param host Application host
   */
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const { url } = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (url.startsWith(`/${this.settings.getAPIPrefix()}`)) {
      return response.status(status).send(exception.message);
    } else if (ALLOWED_EXTENSIONS.filter((ext) => url.indexOf(ext) > 0).length > 0) {
      this.sendFile(url, response);
    } else {
      this.sendIndexFile(response);
    }
  }

  /**
   * Send an adjusted index file to the requested user.
   *
   * The index file will get adjusted by adding some global variables needed by the client (ie 'ROUTE_PREFIX' to let the client know that the app is hosted on a prefixed path).
   *
   * @param response Response to send the index file to.
   */
  private sendIndexFile(response: Response): void {
    const index: string = fs.readFileSync(this.resolvePath('index.html')).toString();
    const prefix = this.settings.getPathPrefix();
    const replaced = index
      .replace(
        /<!--{{global}}-->/g,
        `<script>\n\tconst ROUTE_PREFIX = ${this.getStringForPrefix()};\n</script>`
      )
      .replace('#{ROUTE_PREFIX}', prefix ?? '');

    response.send(replaced);
  }

  private getStringForPrefix(): string {
    const prefix = this.settings.getPathPrefix();

    if (!!prefix) {
      return `"${prefix}"`;
    } else {
      return 'null';
    }
  }

  private resolvePath(file: string): string {
    return path.resolve(`./${this.staticPath}/${file}`);
  }

  private sendFile(file: string, response: Response) {
    response.sendFile(this.resolvePath(file), (err) => {
      if (err && !response.headersSent) {
        response.status(404).send(this.getFileNotFoundExceptionMessage(file));
      }
    });
  }

  private getFileNotFoundExceptionMessage(file: string): string {
    return new NotFoundException(`Could not find '${file}'`).message;
  }
}
