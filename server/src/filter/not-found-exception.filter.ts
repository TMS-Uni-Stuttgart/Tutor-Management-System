import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import path from 'path';
import pug from 'pug';
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
  private readonly staticPath: string;

  constructor(private readonly settings: SettingsService) {
    this.staticPath = settings.getStaticFolder();
  }

  /**
   * Handles the catched exception according to the class documentation.
   *
   * @param exception Catched NotFoundException
   * @param host Application host
   */
  catch(exception: NotFoundException, host: ArgumentsHost): Response<any> | undefined {
    const ctx = host.switchToHttp();
    const { url } = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (!this.isCorrectRootPath(url)) {
      return response.status(404).send(this.getFileNotFoundExceptionMessage(url));
    }

    if (this.isAPIPath(url)) {
      return response.status(status).send(exception.message);
    } else if (this.isFileWithAllowedExtension(url)) {
      this.sendFile(url, response);
    } else {
      this.sendIndexFile(response);
    }
  }

  /**
   *
   * @param url URL to check
   * @returns Is the URL pointing towards an API endpoint (in contrast to, for example, a static path)?
   */
  private isAPIPath(url: string): boolean {
    return url.startsWith(`/${this.settings.getAPIPrefix()}`);
  }

  /**
   *
   * @param url URL to check
   * @returns Does the URL end in a file extension which the server is allowed to send back to the user?
   */
  private isFileWithAllowedExtension(url: string): boolean {
    return ALLOWED_EXTENSIONS.filter((ext) => url.indexOf(ext) > 0).length > 0;
  }

  /**
   * Checks if the given route starts with the correct route prefix.
   *
   * If there is no route prefix set for the server this function always returns `true`. If there is a route prefix configured it returns true if the route starts with the configured prefix and false otherwise.
   *
   * @param url URL to check.
   * @returns If the URL is made for the correct file in regards to a possible route prefix.
   */
  private isCorrectRootPath(url: string): boolean {
    const pathPrefix = this.settings.getPathPrefix();

    if (!!pathPrefix) {
      return url.startsWith(`/${pathPrefix}`);
    } else {
      return true;
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
    const pathToIndex = path.join('./', this.staticPath, 'index.html');
    const prefix = this.settings.getPathPrefix();

    const template = pug.compileFile(pathToIndex, {});
    const replaced = template({ ROUTE_PREFIX: `/${prefix}` ?? '' })
      .replace(
        /<!--\s*#{GLOBAL_VARS}\s*-->/g,
        `<script>\n\tconst ROUTE_PREFIX = ${this.getStringForPrefix()};\n</script>`
      )
      .replace(/(?<!:)\/\//g, '/');
    // Only replace "//" which do NOT have a ":" in front of them (so protocols like "https://" stay correct).

    response.send(replaced);
  }

  /**
   *@returns Returns the string representation for the route prefix.
   */
  private getStringForPrefix(): string {
    const prefix = this.settings.getPathPrefix();

    if (!!prefix) {
      return `"${prefix}"`;
    } else {
      return 'null';
    }
  }

  /**
   * Returns the local path to the given file.
   *
   * This removes the route prefix from the file path before returning it.
   *
   * @param file File path to resolve
   * @returns Path to local file. Does **NOT** include the route prefix.
   */
  private resolvePath(file: string): string {
    const prefix = this.settings.getPathPrefix();
    const normalized = file.replace(`${prefix}/`, '');

    return path.resolve(`./${this.staticPath}/${normalized}`);
  }

  /**
   * Sends the given file (if it exists) to the given response.
   *
   * The filepath will be converted first to point to a local path. This means it can still include a route prefix which will be stripped.
   *
   * If no matching file could be found a 404 is send to the response with an appropriate message.
   *
   * @param file File path to send (may still include the route prefix)
   * @param response Response to send the file to#
   *
   */
  private sendFile(file: string, response: Response) {
    response.sendFile(this.resolvePath(file), (err) => {
      if (err && !response.headersSent) {
        response.status(404).send(this.getFileNotFoundExceptionMessage(file));
      }
    });
  }

  /**
   * @param file File which could not be found.
   * @returns Message which indicates that the given file could not be found.
   */
  private getFileNotFoundExceptionMessage(file: string): string {
    return new NotFoundException(`Could not find '${file}'`).message;
  }
}
