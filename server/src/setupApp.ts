import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filter/not-found-exception.filter';
import { isDevelopment } from './helpers/isDevelopment';
import { SettingsService } from './module/settings/settings.service';
import session = require('express-session');
import passport = require('passport');

/**
 * Sets up the security middleware.
 *
 * This function sets up the security middleware 'passport' and configures sessions.
 *
 * @param app The application itself
 */
function initSecurityMiddleware(app: INestApplication) {
  const loggerContext = 'Init session';
  const settings = app.get(SettingsService);
  Logger.log('Setting up passport...', loggerContext);

  const timeoutSetting = settings.getSessionTimeout();

  Logger.log(`Setting timeout to: ${timeoutSetting} minutes`, loggerContext);

  app.use(
    session({
      secret: settings.getDatabaseConfiguration().secret,
      resave: false,
      // Is used to extend the expries date on every request. This means, maxAge is relative to the time of the last request of a user.
      rolling: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        maxAge: timeoutSetting * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  Logger.log('Passport setup complete.', loggerContext);
}

/**
 * Sets up the Swagger documentation in development.
 *
 * If the server is started in a development environment this function will initialize the swagger documentation. This documentation will then be available at `{API_PREFIX}/docs` which all information that swagger can automatically create from the corresponding endpoints.
 *
 * If the server is __not__ started in a development environment (ie production) this endpoint is __not__ available and this function does nothing.
 *
 * @param app The application itself
 */
function initSwagger(app: INestApplication, apiPrefix: string) {
  if (!isDevelopment()) {
    return;
  }

  const options = new DocumentBuilder()
    .setTitle('Tutor Management System API')
    .setDescription('{{description}}')
    .setVersion('2.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const settings: SettingsService = app.get(SettingsService);
  app.setGlobalPrefix(settings.getAPIPrefix());

  // This filter enables serving an SPA from the given static folder.
  app.useGlobalFilters(new NotFoundExceptionFilter(settings, '/static'));

  initSecurityMiddleware(app);
  initSwagger(app, settings.getAPIPrefix());

  await app.listen(8080);
}
