import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import path from 'path';
import { API_PREFIX } from '../main';

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
  constructor(private readonly staticPath: string = '/static') {}

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

    if (url.startsWith(`/${API_PREFIX}`)) {
      return response.status(status).send(exception.message);
    } else if (ALLOWED_EXTENSIONS.filter((ext) => url.indexOf(ext) > 0).length > 0) {
      this.sendFile(url, response);
    } else {
      this.sendFile('index.html', response);
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
